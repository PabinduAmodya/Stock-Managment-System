package com.StockManawgment.dto;

import com.StockManawgment.Stock_Managment.entity.SaleItem;
import com.StockManawgment.Stock_Managment.entity.Sale;
import java.util.List;

public class SaleRequest {
    private Sale sale;
    private List<SaleItem> items;

    public Sale getSale() { return sale; }
    public void setSale(Sale sale) { this.sale = sale; }
    public List<SaleItem> getItems() { return items; }
    public void setItems(List<SaleItem> items) { this.items = items; }
}
