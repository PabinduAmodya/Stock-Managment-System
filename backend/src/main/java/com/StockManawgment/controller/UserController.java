package com.StockManawgment.Stock_Managment.controller;

import com.StockManawgment.Stock_Managment.dto.PasswordResetRequest;
import com.StockManawgment.Stock_Managment.dto.RoleChangeRequest;
import com.StockManawgment.Stock_Managment.entity.User;
import com.StockManawgment.Stock_Managment.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    // POST /api/users - Create User
    @PostMapping
    public ResponseEntity<User> createUser(@Valid @RequestBody User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(user));
    }

    // GET /api/users - Get All Users
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // GET /api/users/{id} - Get User By ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    // PUT /api/users/{id} - Update User
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @Valid @RequestBody User user) {
        return ResponseEntity.ok(userService.updateUser(id, user));
    }

    // DELETE /api/users/{id} - Delete User
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }

    // PATCH /api/users/{id}/activate - Activate User
    @PatchMapping("/{id}/activate")
    public ResponseEntity<User> activateUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.activateUser(id));
    }

    // PATCH /api/users/{id}/deactivate - Deactivate User
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<User> deactivateUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.deactivateUser(id));
    }

    // PATCH /api/users/{id}/role - Change Role
    @PatchMapping("/{id}/role")
    public ResponseEntity<User> changeRole(@PathVariable Long id, @RequestBody RoleChangeRequest request) {
        return ResponseEntity.ok(userService.changeRole(id, request.getRole()));
    }

    // PATCH /api/users/{id}/reset-password - Reset Password
    @PatchMapping("/{id}/reset-password")
    public ResponseEntity<String> resetPassword(@PathVariable Long id, @RequestBody PasswordResetRequest request) {
        userService.resetPassword(id, request.getPassword());
        return ResponseEntity.ok("Password reset successfully");
    }
}
