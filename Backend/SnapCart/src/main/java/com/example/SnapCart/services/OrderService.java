package com.example.SnapCart.services;

import com.example.SnapCart.dto.CheckoutRequest;
import com.example.SnapCart.dto.PaymentResponse;
import com.example.SnapCart.entity.Order;

import java.util.List;
import java.util.Optional;

public interface OrderService {
    PaymentResponse createOrder(CheckoutRequest checkoutRequest);
    Optional<Order> getOrderById(String orderId);
    List<Order> getOrdersByUserId(String userId);
    Order updateOrderStatus(String orderId, Order.OrderStatus status, String message);
    List<Order> getOrdersBySellerId(String sellerId);
}