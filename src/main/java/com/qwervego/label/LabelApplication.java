package com.qwervego.label;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.qwervego.label"})
public class LabelApplication {

	public static void main(String[] args) {
		SpringApplication.run(LabelApplication.class, args);
	}

}
