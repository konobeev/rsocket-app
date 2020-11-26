import {
    RSocketClient,
    IdentitySerializer, JsonSerializer,
} from 'rsocket-core';
import RSocketWebSocketClient from "rsocket-websocket-client";
import {useEffect, useRef, useState} from "react";
import {ReactiveSocket} from "rsocket-types";
import {interval, Observable, Subject} from "rxjs";
import {ISubscription} from "rsocket-types/ReactiveStreamTypes";

export interface Weather {
    id: number;
    timestamp: number;
    observation: string;
}

export const useChat = () => {
    const [messages, setMessages] = useState([]); // Sent and received messages
    const socketRef = useRef<ReactiveSocket<any, any>>();

    useEffect(() => {

        const client = new RSocketClient({
            // send/receive JSON objects instead of strings/buffers
            serializers: {
                data: JsonSerializer,
                metadata: IdentitySerializer
            },
            setup: {
                // ms btw sending keepalive to server
                keepAlive: 60000,
                // ms timeout if no keepalive response
                lifetime: 180000,
                // format of `data`
                dataMimeType: 'application/json',
                // format of `metadata`
                metadataMimeType: 'message/x.rsocket.routing.v0',
            },
            transport: new RSocketWebSocketClient({
                url: "ws://localhost:9091/rsocket"
            })
        });

        client.connect().subscribe({
            onComplete: socket => {
                console.log("onComplete");
                socketRef.current = socket;
            },
            onError: error => {
                console.log("got connection error");
                console.error(error);
            },
            onSubscribe: cancel => {
                console.log("onSubscribe");
                /* call cancel() to abort */
            }
        });
        // Destroys the socket reference
        // when the connection is closed
        return () => {
            socketRef.current?.close();
        };
    }, []);

    // Sends a message to the server that
    // forwards it to all users in the same room
    const sendMessage = (message: String): Observable<Weather> => {
        const publisher = new Subject<Weather>();
        let subscript:ISubscription;
        const sbt = interval(250).subscribe(tick => subscript?.request(1));

        if (socketRef.current === undefined){
            console.log("socket is undefined")
        }else {

            socketRef.current.requestStream({
                data: message,
                metadata: String.fromCharCode('reqstream'.length) + 'reqstream'

            }).subscribe({
                    onComplete: () => {
                        console.log("requestStream done");
                        publisher.complete();
                    },
                    onError: error => {
                        console.log("got error with requestStream", error);
                        publisher.error(error);
                    },
                    onNext: value => {
                        publisher.next(value.data);
                        // subscript.request(1);
                    },
                    // Nothing happens until `request(n)` is called
                    onSubscribe: sub => {
                        console.log("subscribe request Stream!");
                        subscript = sub;
                        sub.request(1);
                        //this.sent.push(message);
                    }
                });
        }
        return publisher;

    };

    return {sendMessage};
};

