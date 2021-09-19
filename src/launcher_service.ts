//@ts-ignore
const Me = imports.misc.extensionUtils.getCurrentExtension()

import * as ipc_service from 'ipc_service'

const { IpcService } = ipc_service;

/** Reads JSON responses from the launcher service asynchronously, and sends requests.
 *
 * # Note
 * You must call `LauncherService::exit()` before dropping.
 */
export class LauncherService extends IpcService {
    activate(id: number) {
        super.send({ "Activate": id })
    }

    activate_context(id: number, context: number) {
        super.send({ "ActivateContext": { id, context }})
    }

    complete(id: number) {
        super.send({ "Complete": id })
    }

    context(id: number) {
        super.send({ "Context": id })
    }

    exit() {
        if (!super.connection) return
        super.send('Exit')
        super.disconnect()
    }

    query(search: string) {
        super.send({ "Search": search })
    }

    quit(id: number) {
        super.send({ "Quit": id })
    }

    select(id: number) {
        super.send({ "Select": id })
    }
}

/** Launcher types transmitted across the wire as JSON. */
export namespace JsonIPC {
    export interface SearchResult {
        id: number,
        name: string,
        description: string,
        icon?: IconSource,
        category_icon?: IconSource,
        window?: [number, number]
    }


    export type IconSource = IconV.Name | IconV.Mime | IconV.Window

    namespace IconV {
        export interface Name {
            Name: string
        }

        export interface Mime {
            Mime: string
        }

        export interface Window {
            Window: [number, number]
        }
    }

    export type Response = ResponseV.Update | ResponseV.Fill | ResponseV.Close | ResponseV.DesktopEntryR | ResponseV.Context

    namespace ResponseV {
        export type Close = "Close"

        export interface Context {
            "Context": {
                id: number,
                options: Array<ContextOption>
            }
        }

        export interface ContextOption {
            id: number,
            name: string
        }

        export interface Update {
            "Update": Array<SearchResult>
        }

        export interface Fill {
            "Fill": string
        }

        export interface DesktopEntryR {
            "DesktopEntry": DesktopEntry
        }
    }

    export interface DesktopEntry {
        path: string,
        gpu_preference: GpuPreference,
    }

    export type GpuPreference = "Default" | "NonDefault"
}