package com.konomika.rskclient

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.messaging.rsocket.RSocketRequester
import org.springframework.stereotype.Component
import org.springframework.util.MimeTypeUtils
import java.net.URI
import java.time.Instant
import javax.annotation.PostConstruct


@SpringBootApplication
class RskClientApplication

fun main(args: Array<String>) {
	runApplication<RskClientApplication>(*args)
}

@Configuration
class ClientConfig {
	@Bean
	fun requester(builder: RSocketRequester.Builder): RSocketRequester {
		return builder.dataMimeType(MimeTypeUtils.APPLICATION_JSON)
				.websocket(URI.create("ws://localhost:9091/rsocket"))
	}
}

@Component
class Clientervice(private val requester: RSocketRequester){
	@PostConstruct
	fun reqStream() {
		requester.route("reqstream")
				.data(Instant.now())
				.retrieveFlux(Weather::class.java)
				.subscribe { ac -> println("🛩🛩 $ac") }
	}

}

data class Weather(val timestamp: Instant, val observation: String)
