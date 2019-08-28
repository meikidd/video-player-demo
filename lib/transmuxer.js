class Transmuxer {
  transmuxer;
  onTransmuxDone;

  constructor() {
    let remuxedSegments = [],
      remuxedInitSegment = null,
      remuxedBytesLength = 0,
      createInitSegment = true,
      bytes,
      i,
      j;
    this.transmuxer = new muxjs.mp4.Transmuxer();
    this.transmuxer.on("data", function(event) {
      remuxedSegments.push(event);
      remuxedBytesLength += event.data.byteLength;
      remuxedInitSegment = event.initSegment;
    });
    this.transmuxer.on("done", () => {
      var offset = 0;
      if (createInitSegment) {
        bytes = new Uint8Array(
          remuxedInitSegment.byteLength + remuxedBytesLength
        );
        bytes.set(remuxedInitSegment, offset);
        offset += remuxedInitSegment.byteLength;
        createInitSegment = false;
      } else {
        bytes = new Uint8Array(remuxedBytesLength);
      }
      for (j = 0, i = offset; j < remuxedSegments.length; j++) {
        bytes.set(remuxedSegments[j].data, i);
        i += remuxedSegments[j].byteLength;
      }
      remuxedSegments = [];
      remuxedBytesLength = 0;

      this.onTransmuxDone && this.onTransmuxDone(bytes);
    });
  }

  on(event, callback) {
    this.onTransmuxDone = callback;
  }

  push(data) {
    this.transmuxer.push(data);
  }

  flush() {
    this.transmuxer.flush();
  }
}
