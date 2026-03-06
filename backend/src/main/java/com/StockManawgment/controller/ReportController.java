package com.StockManawgment.controller;

import com.StockManawgment.entity.Product;
import com.StockManawgment.entity.Supplier;
import com.StockManawgment.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/sales")
    public ResponseEntity<Map<String, Object>> getSalesReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(reportService.getSalesReport(start, end));
    }

    @GetMapping("/purchases")
    public ResponseEntity<Map<String, Object>> getPurchaseReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(reportService.getPurchaseReport(start, end));
    }

    @GetMapping("/profit")
    public ResponseEntity<Map<String, Object>> getProfitReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(reportService.getProfitReport(start, end));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<Product>> getLowStockReport() {
        return ResponseEntity.ok(reportService.getLowStockReport());
    }

    @GetMapping("/suppliers")
    public ResponseEntity<List<Supplier>> getSupplierReport() {
        return ResponseEntity.ok(reportService.getSupplierReport());
    }

    // GET /api/reports/daily-sales/csv?date=2026-03-02
    @GetMapping(value = "/daily-sales/csv", produces = "text/csv")
    public ResponseEntity<byte[]> downloadDailySalesCsv(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        String csv = reportService.buildDailySalesCsv(date);
        String usedDate = (date != null ? date : LocalDate.now()).toString();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=daily_sales_" + usedDate + ".csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv.getBytes(StandardCharsets.UTF_8));
    }
}