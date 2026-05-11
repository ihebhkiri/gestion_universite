package com.iheb.gestion_universite.student_managment.student_payment;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;

@Service
public class StudentPaymentReceiptPdfService {

    public byte[] generateReceipt(StudentPaymentEntity payment, StudentPaymentAccountEntity account) {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 42, 42, 48, 48);
            PdfWriter.getInstance(document, outputStream);
            document.open();

            addTitle(document);
            addPaymentDetails(document, payment, account);
            addFooter(document);

            document.close();
            return outputStream.toByteArray();
        } catch (DocumentException ex) {
            throw new IllegalStateException("Unable to generate payment receipt PDF", ex);
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to generate payment receipt PDF", ex);
        }
    }

    private void addTitle(Document document) throws DocumentException {
        Paragraph title = new Paragraph("Re\u00e7u de paiement", font(20, Font.BOLD, new Color(2, 36, 72)));
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(24);
        document.add(title);
    }

    private void addPaymentDetails(
            Document document,
            StudentPaymentEntity payment,
            StudentPaymentAccountEntity account
    ) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{0.8f, 1.2f});

        addRow(table, "N\u00b0 re\u00e7u", payment.getReceiptNumber());
        addRow(table, "\u00c9tudiant", fullName(account));
        addRow(table, "Programme acad\u00e9mique", programName(account));
        addRow(table, "Plan de paiement", label(account.getPaymentPlan()));
        addRow(table, "Date de paiement", payment.getPaymentDate().toString());
        addRow(table, "Montant pay\u00e9", money(payment.getAmount()));
        addRow(table, "Ancien reste \u00e0 payer", money(payment.getPreviousRemainingAmount()));
        addRow(table, "Nouveau reste \u00e0 payer", money(payment.getNewRemainingAmount()));

        document.add(table);
    }

    private void addFooter(Document document) throws DocumentException {
        Paragraph footer = new Paragraph(
                "D\u00e9partement Finance",
                font(10, Font.BOLD, new Color(2, 36, 72))
        );
        footer.setSpacingBefore(24);
        footer.setAlignment(Element.ALIGN_RIGHT);
        document.add(footer);
    }

    private void addRow(PdfPTable table, String label, String value) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, font(10, Font.BOLD, new Color(80, 80, 80))));
        labelCell.setPadding(10);
        labelCell.setBorderColor(new Color(225, 230, 238));
        labelCell.setBackgroundColor(new Color(248, 250, 252));

        PdfPCell valueCell = new PdfPCell(new Phrase(value, font(10, Font.NORMAL, new Color(20, 20, 20))));
        valueCell.setPadding(10);
        valueCell.setBorderColor(new Color(225, 230, 238));

        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    private Font font(int size, int style, Color color) {
        Font font = new Font(Font.HELVETICA, size, style);
        font.setColor(color);
        return font;
    }

    private String money(BigDecimal amount) {
        DecimalFormatSymbols symbols = new DecimalFormatSymbols();
        symbols.setGroupingSeparator(' ');
        symbols.setDecimalSeparator(',');
        DecimalFormat formatter = new DecimalFormat("#,##0.##", symbols);
        return formatter.format(amount) + " TND";
    }

    private String label(PaymentPlan paymentPlan) {
        return switch (paymentPlan) {
            case MONTHLY_DURING_STUDIES -> "Paiement mensuel pendant les \u00e9tudes";
            case DEFERRED_AFTER_GRADUATION -> "Paiement diff\u00e9r\u00e9 apr\u00e8s la diplomation";
        };
    }

    private String programName(StudentPaymentAccountEntity account) {
        if (account.getEnrollment() != null
                && account.getEnrollment().getGroup() != null
                && account.getEnrollment().getGroup().getAcademicClass() != null
                && account.getEnrollment().getGroup().getAcademicClass().getProgram() != null
                && account.getEnrollment().getGroup().getAcademicClass().getProgram().getName() != null
                && !account.getEnrollment().getGroup().getAcademicClass().getProgram().getName().isBlank()) {
            return account.getEnrollment().getGroup().getAcademicClass().getProgram().getName();
        }

        return "information non disponible";
    }

    private String fullName(StudentPaymentAccountEntity account) {
        String firstName = account.getStudent().getFirstName() != null ? account.getStudent().getFirstName() : "";
        String lastName = account.getStudent().getLastName() != null ? account.getStudent().getLastName() : "";
        return (firstName + " " + lastName).trim();
    }
}
