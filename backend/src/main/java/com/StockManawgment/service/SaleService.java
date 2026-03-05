package com.StockManawgment.service;

import com.StockManawgment.entity.Product;
import com.StockManawgment.entity.SaleItem;
import com.StockManawgment.entity.Sale;
import com.StockManawgment.entity.Stock;
import com.StockManawgment.exception.BadRequestException;
import com.StockManawgment.exception.ResourceNotFoundException;
import com.StockManawgment.repository.ProductRepository;
import com.StockManawgment.repository.SaleItemRepository;
import com.StockManawgment.repository.SaleRepository;
import com.StockManawgment.repository.StockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;

@Service
public class SaleService {

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private SaleItemRepository saleItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private StockRepository stockRepository;

    @Transactional
    public Sale createSale(Sale sale, List<SaleItem> items) {
        // First validate all stock levels
        for (SaleItem item : items) {
            Product product = productRepository.findById(item.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + item.getProduct().getId()));
            if (product.getQuantity() < item.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product: " + product.getName()
                        + ". Available: " + product.getQuantity() + ", Requested: " + item.getQuantity());
            }
        }

        // Save sale
        Sale savedSale = saleRepository.save(sale);

        BigDecimal total = BigDecimal.ZERO;
        for (SaleItem item : items) {
            Product product = productRepository.findById(item.getProduct().getId()).get();

            // Deduct stock
            product.setQuantity(product.getQuantity() - item.getQuantity());
            productRepository.save(product);

            // Record stock movement
            Stock stock = new Stock();
            stock.setProduct(product);
            stock.setQuantityAdded(-item.getQuantity());
            stock.setType(Stock.StockType.ADJUSTMENT);
            stock.setNote("Sale #" + savedSale.getId());
            stockRepository.save(stock);

            // Calculate item total
            if (item.getTotalPrice() == null && item.getUnitPrice() != null) {
                item.setTotalPrice(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            }
            item.setSale(savedSale);
            saleItemRepository.save(item);
            total = total.add(item.getTotalPrice() != null ? item.getTotalPrice() : BigDecimal.ZERO);
        }

        savedSale.setTotalAmount(total);
        return saleRepository.save(savedSale);
    }

    public List<Sale> getAllSales() {
        return saleRepository.findAll();
    }

    public Sale getSaleById(Long id) {
        return saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found with id: " + id));
    }

    public Sale updateSale(Long id, Sale saleDetails) {
        Sale sale = getSaleById(id);
        sale.setCustomerName(saleDetails.getCustomerName());
        sale.setPaymentMethod(saleDetails.getPaymentMethod());
        return saleRepository.save(sale);
    }

    public void deleteSale(Long id) {
        saleRepository.delete(getSaleById(id));
    }

    public List<SaleItem> getSaleItems(Long saleId) {
        return saleItemRepository.findBySaleId(saleId);
    }

    public Sale generateInvoice(Long saleId) {
        return getSaleById(saleId);
    }

    public List<Sale> getSalesByCustomer(Long customerId) {
        return saleRepository.findByCustomerId(customerId);
    }
}
