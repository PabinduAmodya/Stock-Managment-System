package com.StockManawgment.service;

import com.StockManawgment.entity.Product;
import com.StockManawgment.entity.Purchase;
import com.StockManawgment.entity.Sale;
import com.StockManawgment.entity.Supplier;
import com.StockManawgment.repository.ProductRepository;
import com.StockManawgment.repository.PurchaseRepository;
import com.StockManawgment.repository.SaleRepository;
import com.StockManawgment.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportService {

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private PurchaseRepository purchaseRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    public Map<String, Object> getSalesReport(LocalDateTime start, LocalDateTime end) {
        List<Sale> sales = saleRepository.findByDateBetween(start, end);
        BigDecimal total = saleRepository.getTotalSalesAmount(start, end);
        Map<String, Object> report = new HashMap<>();
        report.put("sales", sales);
        report.put("totalSalesAmount", total);
        report.put("totalTransactions", sales.size());
        report.put("from", start);
        report.put("to", end);
        return report;
    }

    public Map<String, Object> getPurchaseReport(LocalDateTime start, LocalDateTime end) {
        List<Purchase> purchases = purchaseRepository.findByDateBetween(start, end);
        BigDecimal total = purchases.stream()
                .map(Purchase::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        Map<String, Object> report = new HashMap<>();
        report.put("purchases", purchases);
        report.put("totalPurchaseAmount", total);
        report.put("totalTransactions", purchases.size());
        report.put("from", start);
        report.put("to", end);
        return report;
    }

    public Map<String, Object> getProfitReport(LocalDateTime start, LocalDateTime end) {
        List<Sale> sales = saleRepository.findByDateBetween(start, end);
        List<Purchase> purchases = purchaseRepository.findByDateBetween(start, end);

        BigDecimal totalRevenue = saleRepository.getTotalSalesAmount(start, end);
        BigDecimal totalCost = purchases.stream()
                .map(Purchase::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal profit = totalRevenue.subtract(totalCost);

        Map<String, Object> report = new HashMap<>();
        report.put("totalRevenue", totalRevenue);
        report.put("totalCost", totalCost);
        report.put("profit", profit);
        report.put("salesCount", sales.size());
        report.put("from", start);
        report.put("to", end);
        return report;
    }

    public List<Product> getLowStockReport() {
        return productRepository.findLowStockProducts();
    }

    public List<Supplier> getSupplierReport() {
        return supplierRepository.findAll();
    }

    /**
     * Build a Daily Sales CSV for a given date.
     * Columns: SaleId, DateTime, Customer, PaymentMethod, TotalAmount
     */
    public String buildDailySalesCsv(LocalDate date) {
        if (date == null) {
            date = LocalDate.now();
        }

        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(23, 59, 59);

        List<Sale> sales = saleRepository.findByDateBetween(start, end);
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        StringBuilder sb = new StringBuilder();
        sb.append("SaleId,DateTime,Customer,PaymentMethod,TotalAmount\n");

        for (Sale s : sales) {
            String customer = "Walk-in";
            if (s.getCustomer() != null && s.getCustomer().getName() != null) {
                customer = s.getCustomer().getName();
            } else if (s.getCustomerName() != null && !s.getCustomerName().isBlank()) {
                customer = s.getCustomerName();
            }

            sb.append(s.getId() != null ? s.getId() : "")
                    .append(',')
                    .append(s.getDate() != null ? dtf.format(s.getDate()) : "")
                    .append(',')
                    .append(csvEscape(customer))
                    .append(',')
                    .append(s.getPaymentMethod() != null ? s.getPaymentMethod().name() : "")
                    .append(',')
                    .append(s.getTotalAmount() != null ? s.getTotalAmount() : BigDecimal.ZERO)
                    .append('\n');
        }

        return sb.toString();
    }

    private String csvEscape(String value) {
        if (value == null) return "";
        String v = value.replace("\"", "\"\"");
        if (v.contains(",") || v.contains("\n") || v.contains("\r")) {
            return '"' + v + '"';
        }
        return v;
    }
}