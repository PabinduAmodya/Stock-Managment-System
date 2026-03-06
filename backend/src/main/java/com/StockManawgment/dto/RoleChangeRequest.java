package com.StockManawgment.dto;

import com.StockManawgment.entity.User;

public class RoleChangeRequest {
    private User.Role role;
    public User.Role getRole() { return role; }
    public void setRole(User.Role role) { this.role = role; }
}
