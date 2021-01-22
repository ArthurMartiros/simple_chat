import { parentPort, workerData } from 'worker_threads';
import * as Filter from 'bad-words';
const filter = new Filter();

function arrayEquals(arr1, arr2) {
    if (arr1.length != arr2.length)
    return false;

    for (var i = 0, l=arr1.length; i < l; i++) {
        if (arr1[i] instanceof Array && arr2[i] instanceof Array) {
            if (!arr1[i].equals(arr2[i]))
                return false;       
        }           
        else if (arr1[i] != arr2[i]) { 
            return false;   
        }           
    }       
    return true;
}

parentPort.on('message', (params) => {
    const contnet = params.map(d => d._doc.text);
    let hasBadWords = false;
    if(contnet) {
      filter.addWords(...contnet);
      const cleaned = filter.clean(contnet.toString());
      hasBadWords = arrayEquals(contnet, cleaned);
    }
    parentPort.postMessage(!hasBadWords);
});