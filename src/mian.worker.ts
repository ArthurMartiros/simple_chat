import { Worker }  from 'worker_threads';


export class MainWorker extends Worker {
    constructor(path: string, data = null) {
        super(`${__dirname}/${path}`, {
            workerData: data
        });
       
    }
    
    public getMessage() {
        return new Promise((resolve, reject) => {
            this.on('message', (data) => {
                resolve({err: false, data});
            });
            this.on('error', (err) => {
                reject({error: true, err});
            });
            this.on('exit', (code) => {
                if (code !== 0) {
                    reject({error: true, err: `Worker Exited With Status Code: ${code}`});
                }
                resolve({err: false, data: null});
            });
        });
    }
}