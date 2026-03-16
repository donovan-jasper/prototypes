class Video {
  constructor(id, url, scriptId, voiceoverId, videoPath) {
    this.id = id;
    this.url = url;
    this.scriptId = scriptId;
    this.voiceoverId = voiceoverId;
    this.videoPath = videoPath;
  }
}

module.exports = Video;
