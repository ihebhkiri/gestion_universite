package com.iheb.gestion_universite.security.auth.services;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

@Service
@RequiredArgsConstructor
public class MailService {

    public static final String URL = "https://academix.duckdns.org/auth/reset-password?token=";

    private final JavaMailSender mailSender;

    private final SpringTemplateEngine templateEngine;


    @Async
    public void sendResetMail (String to, String resetToken) throws Exception {


        Context context = new Context();
        String link = URL + resetToken;
        context.setVariable("link", link);
        String htmlContent = templateEngine.process("reset-password", context);

        MimeMessage message = mailSender.createMimeMessage();

        MimeMessageHelper helper =
                new MimeMessageHelper(message, true);
        helper.setFrom("ihebhk10@gmail.com", "Administration University");


        helper.setTo(to);
        helper.setSubject("Reset Password");
        helper.setText(
                htmlContent,
                true
        );

//        ClassPathResource file =
//                new ClassPathResource("files/spring_boot_angular.pdf");
//
//        helper.addAttachment("spring_boot_angular.pdf", file);
        mailSender.send(message);
    }

}