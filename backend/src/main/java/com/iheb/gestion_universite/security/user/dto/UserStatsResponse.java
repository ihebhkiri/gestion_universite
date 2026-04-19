package com.iheb.gestion_universite.security.user.dto;

public record UserStatsResponse(long totalUsers,

                                long activeUsers,

                                long inactiveUsers) {

}
