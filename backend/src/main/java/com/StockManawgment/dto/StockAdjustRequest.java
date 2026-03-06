package com.StockManawgment.dto;

public class StockAdjustRequest {
    private int adjustment;
    private String note;

    public int getAdjustment() { return adjustment; }
    public void setAdjustment(int adjustment) { this.adjustment = adjustment; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
