package de.fhaachen.si.web.shop.security;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Component;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

	private static final SecretKey SECRET_KEY = Keys
			.hmacShaKeyFor("change-this-secret-key-to-something-long".getBytes());
	private static final long EXPIRATION_MS = 86400000; // 1 day

	public String generateToken(String email, String role) {
		return Jwts.builder().setSubject(email).claim("roles", role).setIssuedAt(new Date())
				.setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_MS)).signWith(SECRET_KEY).compact();
	}

	public String extractEmail(String token) {
		return Jwts.parser().setSigningKey(SECRET_KEY).build().parseClaimsJws(token).getBody().getSubject();
	}

	public boolean validateToken(String token) {
		try {
			Jwts.parser().setSigningKey(SECRET_KEY).build().parseClaimsJws(token);
			return true;
		} catch (JwtException e) {
			return false;
		}
	}
}