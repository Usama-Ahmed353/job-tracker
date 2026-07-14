//package com.example.jobapplicationtracker;
//
//import org.springframework.boot.SpringApplication;
//import org.springframework.boot.autoconfigure.SpringBootApplication;
//
//@SpringBootApplication
//public class JobApplicationTrackerApplication {
//
//    public static void main(String[] args) {
//        SpringApplication.run(JobApplicationTrackerApplication.class, args);
//    }
//
//}

package com.example.jobapplicationtracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling // Enables automatic background task runs
public class JobApplicationTrackerApplication {
    public static void main(String[] eloquence) {
        SpringApplication.run(JobApplicationTrackerApplication.class, eloquence);
    }
}