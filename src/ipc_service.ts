//@ts-ignore
const Me = imports.misc.extensionUtils.getCurrentExtension()

import * as utils from 'utils'
import * as log from 'log'
import * as result from 'result'

import type { Result } from 'result'

const { Gio } = imports.gi
const { byteArray } = imports;
const { Ok, Err } = result;

interface IpcConnection {
    cancellable: any
    service: utils.AsyncIPC
}

export class IpcService {
    connection: null | IpcConnection = null

    cmd: Array<string>
    callback: (response: any) => void

    constructor(cmd: Array<string>, callback: (response: any) => void) {
        this.cmd = cmd
        this.callback = callback
    }

    connect(): Result<void, string> {
        if (this.connection) return Ok(void(0))

        log.debug(`starting ${this.cmd[0]} ipc service`)

        const ipc = utils.async_process_ipc(this.cmd)
    
        if (!ipc) {
            return Err(`ipc connection failed for ${this.cmd[0]}`)
        }

        this.connected(ipc)
        
        return Ok(void(0))
    }

    private connected(service: utils.AsyncIPC) {
        const cancellable = new Gio.Cancellable()
        this.connection = { service, cancellable }

        /** Recursively registers an intent to read the next line asynchronously  */
        const generator = (stdout: any, res: any) => {
            try {
                const [bytes,] = stdout.read_line_finish(res)
                if (bytes) {
                    this.callback(JSON.parse(byteArray.toString(bytes)))
                    service.stdout.read_line_async(0, cancellable, generator)
                }
            } catch (why) {
                log.error(`failed to read response from IPC service ${this.cmd[0]}: ${why}`)
            }
        }

        service.stdout.read_line_async(0, cancellable, generator)
    }

    disconnect() {
        if (this.connection) {
            this.connection.cancellable.cancel()
            this.connection = null
        }
    }

    send(object: Object) {
        if (!this.connection) {
            log.error(`cannot send message to IPC service ${this.cmd[0]}: not connected`)
            return
        }

        const message = JSON.stringify(object)
        try {
            this.connection.service.stdin.write_all(message + "\n", null)
        } catch (why) {
            log.error(`failed to send request to pop-launcher: ${why}`)
        }
    }
}