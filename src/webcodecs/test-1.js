// 使用canvas mediaRecorder 图片生成视频
document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const imagesInput = document.getElementById('images');
    const fpsInput = document.getElementById('fps');
    const qualitySelect = document.getElementById('quality');
    const generateBtn = document.getElementById('generate');
    const previewContainer = document.getElementById('preview');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const statusText = document.getElementById('status');
    const resultContainer = document.getElementById('result');
    
    // 存储选择的图片
    let selectedImages = [];
    
    // 监听图片选择事件
    imagesInput.addEventListener('change', (e) => {
        selectedImages = Array.from(e.target.files);
        
        // 清空预览区域
        previewContainer.innerHTML = '';
        
        // 显示图片预览
        if (selectedImages.length > 0) {
            selectedImages.forEach((file, index) => {
                if (index < 10) { // 只预览前10张图片
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        img.title = file.name;
                        previewContainer.appendChild(img);
                    };
                    reader.readAsDataURL(file);
                }
            });
            
            if (selectedImages.length > 10) {
                const moreText = document.createElement('div');
                moreText.textContent = `...还有 ${selectedImages.length - 10} 张图片`;
                previewContainer.appendChild(moreText);
            }
        }
    });
    
    // 生成视频按钮点击事件
    generateBtn.addEventListener('click', async () => {
        if (selectedImages.length < 2) {
            alert('请至少选择两张图片');
            return;
        }
        
        // 获取参数
        const fps = parseInt(fpsInput.value) || 30;
        const quality = parseFloat(qualitySelect.value) || 0.6;
        
        // 显示进度条
        progressContainer.style.display = 'block';
        progressBar.style.width = '0%';
        resultContainer.innerHTML = '';
        
        try {
            await generateVideo(selectedImages, fps, quality);
        } catch (error) {
            console.error('生成视频时出错:', error);
            statusText.textContent = `错误: ${error.message}`;
        }
    });

    // 生成视频的主函数
    async function generateVideo(imageFiles, fps, quality) {
        try {
            // 检查 MediaRecorder 是否可用
            if (!('MediaRecorder' in window)) {
                throw new Error('您的浏览器不支持 MediaRecorder API');
            }
            
            statusText.textContent = '正在准备生成视频...';
            
            // 创建 canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 加载第一张图片以获取尺寸
            const firstImage = await createImageBitmap(imageFiles[0]);
            canvas.width = firstImage.width;
            canvas.height = firstImage.height;
            firstImage.close();
            
            // 创建媒体流
            const stream = canvas.captureStream(fps);
            
            // 设置 MediaRecorder 选项
            const options = {
                // mimeType: 'video/webm;codecs=vp9',
                mimeType: 'video/mp4;codecs=vp9',
                videoBitsPerSecond: 5000000 * quality
            };
            
            // 创建 MediaRecorder
            const mediaRecorder = new MediaRecorder(stream, options);
            const chunks = [];
            
            // 确保在开始录制前设置好事件监听器
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };
            
            // 添加错误处理
            mediaRecorder.onerror = (e) => {
                console.error('MediaRecorder 错误:', e.error);
                throw new Error('视频录制出错: ' + e.error.message);
            };
            
            // 开始录制，设置时间片为100ms
            mediaRecorder.start(100); // 重要：设置时间片
            
            // 处理每一张图片
            for (let i = 0; i < imageFiles.length; i++) {
                // 更新进度
                statusText.textContent = `处理图片 ${i+1}/${imageFiles.length}`;
                progressBar.style.width = `${Math.round((i+1) / imageFiles.length * 90)}%`;
                
                // 加载图片
                const img = await createImageBitmap(imageFiles[i]);
                
                // 绘制到 canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                img.close();
                
                // 确保绘制完成
                await new Promise(resolve => requestAnimationFrame(resolve));
                
                // 等待一帧的时间
                await new Promise(resolve => setTimeout(resolve, 1000 / fps));
            }
            
            // 停止录制并等待数据可用
            return new Promise((resolve) => {
                mediaRecorder.onstop = async () => {
                    // 创建视频 Blob
                    const videoBlob = new Blob(chunks, { type: chunks[0].type });
                    const videoUrl = URL.createObjectURL(videoBlob);
                    
                    // 显示视频
                    resultContainer.innerHTML = `
                        <h3>生成的视频</h3>
                        <video controls width="100%" src="${videoUrl}"></video>
                        <p>
                            <a href="${videoUrl}" download="generated_video.mp4" class="download-btn">
                                <button>下载视频</button>
                            </a>
                        </p>
                    `;
                    
                    statusText.textContent = '视频生成完成！';
                    progressBar.style.width = '100%';
                    resolve();
                };
                
                // 确保所有数据都已处理
                mediaRecorder.requestData();
                mediaRecorder.stop();
            });
            
        } catch (error) {
            console.error('生成视频时出错:', error);
            throw error;
        }
    }

});