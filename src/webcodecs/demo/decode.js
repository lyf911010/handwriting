// 创建MP4Box文件解析器实例
const mp4boxfile = MP4Box.createFile();
const inputDom = document.getElementById('video-input');
const previewDom = document.getElementById('preview-section');
let videoDecoder = null

// 视频总样本数
let nbSampleTotal = 0

// 当前已处理的样本数
let countSample = 0

let frameIndex = 0;

inputDom.addEventListener('change', handleUploadFile)

mp4boxfile.onReady = handleFileReady
mp4boxfile.onSamples = handleFileSamples

async function handleUploadFile(e) {
  // 获取用户选择的文件
  const file = e.target.files[0]
  // 将文件转换为ArrayBuffer
  let fileBuffer = await file.arrayBuffer();
  // 设置文件起始位置
  fileBuffer.fileStart = 0;
  // 将文件数据添加到MP4Box解析器
  mp4boxfile.appendBuffer(fileBuffer)
  // 刷新解析器，触发onReady事件
  mp4boxfile.flush()
}

function handleFileReady(info) {
    console.log('handleFileReady', info)
    // 获取视频轨道信息
    const videoTrack = info.videoTracks[0]
    // 解构获取视频编码、宽度、高度和样本数
    const { codec, track_width, track_height, nb_samples } = videoTrack;

    if (videoTrack) {
      // 设置视频轨道的提取选项
      mp4boxfile.setExtractionOptions(videoTrack.id, 'video', {
        nbSamples: nb_samples
      })
    }

    // 记录总样本数
    nbSampleTotal = nb_samples

    // 初始化视频解码器
    initVideoDecoder(codec, track_width, track_height)
    mp4boxfile.start()
}

function handleFileSamples(id, user, samples) {
    console.log('handleFileSamples', id, user, samples)
    mp4boxfile.stop()

    // 更新已处理样本计数
    countSample += samples.length

    // 处理每个样本
    for (const sample of samples) {
      // 判断样本类型：关键帧或非关键帧
      const type = sample.is_sync ? 'key' : 'delta'

      // 创建编码视频块
      const chunk = new EncodedVideoChunk({
        type,
        timestamp: sample.cts,  // 合成时间戳
        duration: sample.duration,  // 持续时间
        data: sample.data  // 样本数据
      })

      // 将编码块送入解码器
      videoDecoder.decode(chunk)
    }

    // 如果所有样本都已处理，刷新解码器
    if (countSample === nbSampleTotal) {
      videoDecoder.flush();
    }
}

// 初始化视频解码器
function initVideoDecoder(codec, videoW, videoH) {
    // 创建VideoDecoder实例
    videoDecoder = new VideoDecoder({
        // 设置帧输出回调
        output: handleFrame,
        // 设置错误处理回调
        error: err => console.log(err)
    })

    // 配置解码器
    videoDecoder.configure({
        codec: codec,  // 视频编解码器
        codedWidth: videoW,  // 编码宽度
        codedHeight: videoH,  // 编码高度
        description: getExtradata()  // 解码器配置数据
    });
}

// 处理解码后的视频帧
async function handleFrame(frame) {
    // 将VideoFrame转换为ImageBitmap以便绘制
    const img = await createImageBitmap(frame)
    // 创建canvas元素用于渲染帧
    const canvas = document.createElement('canvas')
    // 获取2D绘图上下文
    const ctx = canvas.getContext('2d')
    // 设置canvas尺寸与帧尺寸一致
    canvas.width = frame.displayWidth
    canvas.height = frame.displayHeight


    // 将canvas添加到页面
    document.body.appendChild(canvas)
    // 将帧绘制到canvas上
    ctx.drawImage(img,0,0,canvas.width,canvas.height)
    // 在视频帧上叠加绘制帧号（显示在右上角）
    ctx.save();
    ctx.fillStyle = 'rgba(255,0,0,0.7)';
    ctx.font = 'bold 280px serif';
    ctx.textAlign = 'right';
    ctx.fillText(`#${frameIndex}`, canvas.width - 20, 280);
    ctx.restore();

    frameIndex++; // 移动到绘制完成后递增索引
    // 将canvas内容转换为图片URL
    const url = canvas.toDataURL()

    // 创建img元素显示帧
    const imgDOM = document.createElement('img')
    // 设置图片源
    imgDOM.src = url
    // 设置图片尺寸为原始尺寸的20%
    imgDOM.width = canvas.width
    imgDOM.height = canvas.height
    // 将图片添加到页面
    
    const preDOM = document.createElement('div')
    preDOM.className = 'frame-preview'
    preDOM.appendChild(imgDOM)
    previewDom.appendChild(preDOM)
    // 移除临时canvas
    document.body.removeChild(canvas)
    // 释放帧资源
    frame.close();
}

function getExtradata() {
    // 生成VideoDecoder.configure需要的description信息
    // 获取MP4文件中的视频样本描述条目
    const entry = mp4boxfile.moov.traks[0].mdia.minf.stbl.stsd.entries[0];

    // 获取对应编码类型的配置盒子
    const box = entry.avcC ?? entry.hvcC ?? entry.vpcC;
    if (box != null) {
        // 创建数据流用于序列化盒子数据
        const stream = new DataStream(
            undefined,
            0,
            DataStream.BIG_ENDIAN
        )
        // 将盒子数据写入流
        box.write(stream)
        // slice()方法的作用是移除moov box的header信息
        return new Uint8Array(stream.buffer.slice(8))
    }
}