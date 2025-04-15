class ImageToVideoConverter {
    constructor(options = {}) {
      this.width = options.width || 640;
      this.height = options.height || 480;
      this.frameRate = options.frameRate || 30;
      this.bitrate = options.bitrate || 10000000; // 10 Mbps
      this.encoder = null;
      this.chunks = [];
      this.ready = false;
    }
  
    async init() {
      const encoderConfig = {
        codec: 'avc1.42E032', // H.264 baseline profile
        width: this.width,
        height: this.height,
        bitrate: this.bitrate,
        framerate: this.frameRate,
        hardwareAcceleration: 'prefer-software',
        avc: { format: 'annexb' }
      };
  
      const encoderInit = {
        output: (chunk) => this.chunks.push(chunk),
        error: (e) => console.error('Encoder error:', e),
      };
  
      this.encoder = new VideoEncoder(encoderInit);
      await this.encoder.configure(encoderConfig);
      this.ready = true;
    }
  
    async encodeImages(images) {
      if (!this.ready) {
        await this.init();
      }
  
      const frameDuration = 1000000 / this.frameRate; // microseconds per frame
  
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const bitmap = await createImageBitmap(image);
        
        const frame = new VideoFrame(bitmap, {
          timestamp: i * frameDuration,
          duration: frameDuration
        });
  
        const keyFrame = i === 0; // First frame should be a keyframe
        this.encoder.encode(frame, { keyFrame });
        frame.close();
        bitmap.close(); 
      }
  
      await this.encoder.flush();
    }
  
    getVideoBlob() {
      const blob = new Blob(this.chunks, { type: 'video/mp4' });
      return blob;
    }
  
    async cleanup() {
      if (this.encoder) {
        await this.encoder.close();
        this.encoder = null;
      }
      this.chunks = [];
    }
  }