package com.konomika.rskserver

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.messaging.handler.annotation.MessageMapping
import org.springframework.stereotype.Controller
import reactor.core.publisher.Flux
import reactor.core.publisher.Hooks
import reactor.core.publisher.Mono
import java.time.Duration
import java.time.Instant
import java.util.*


@SpringBootApplication
class RskServerApplication

fun main(args: Array<String>) {
    Hooks.onErrorDropped { err: Throwable ->
        println("Disconnecting client " + err
                .localizedMessage)
    }
    runApplication<RskServerApplication>(*args)
}

@Controller
internal class AircraftServerController {
    private val obsList = listOf("SKC, VIS 12SM", "OVC 800, VIS 1/2SM", "BKN 8000, VIS 10SM")
    val rnd = Random()


    // Request-Stream
    @MessageMapping("reqstream")
    fun reqStream(timestampMono: Mono<String>): Flux<Weather> {
        return timestampMono.doOnNext { ts: String -> println("⏱ $ts") }
                .thenMany(Flux.interval(Duration.ofMillis(25))
                        .map { Weather(it, Instant.now(), obsList[rnd.nextInt(obsList.size)]) }
                        .onBackpressureLatest())
    }
}

data class Weather(val id: Long, val timestamp: Instant, val observation: String)
