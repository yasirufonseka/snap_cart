package com.example.SnapCart;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;


@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class })
public class SnapCartApplication {

	public static void main(String[] args) {
		SpringApplication.run(SnapCartApplication.class, args);
	}

}
 