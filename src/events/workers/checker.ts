import { parentPort, workerData } from 'worker_threads';
import * as bad_words from 'badwords-list';

parentPort.on('message', (params) => {
  const content = params.map(d => d._doc.text);
  let hasBadWords = false;
  if(content) {
    const library = bad_words.array;
    const intersection = content.filter(element => library.includes(element));
    hasBadWords = Boolean(intersection && intersection.length);
  }
  parentPort.postMessage(hasBadWords);
});