# Nginx Configuration for Eco-Dex API Gateway

This directory contains the Nginx configuration files for the Eco-Dex API Gateway, which handles routing and load balancing for all microservices.

## Directory Structure

```
├── nginx.conf           # Main Nginx configuration file
└── conf.d/              # Configuration directory
    └── api_gateway.conf # API Gateway specific configuration
```

## Configuration Overview

### Main Configuration (nginx.conf)
- Worker process and event settings
- SSL/TLS security configurations
- Gzip compression settings
- Global security headers
- Rate limiting configurations
- Logging settings

### API Gateway Configuration (api_gateway.conf)
- Upstream definitions for all microservices
- HTTPS redirection
- SSL certificate configuration
- Proxy settings for each service endpoint
- Health check endpoint
- Error page configurations

## SSL/TLS Setup

1. Place your SSL certificates in `/etc/nginx/ssl/`:
   - `ecodex.crt`: SSL certificate
   - `ecodex.key`: Private key
   - `dhparam.pem`: DH parameters for DHE ciphersuites

2. Update the server_name in api_gateway.conf to match your domain.

## Security Features

- HTTP to HTTPS redirection
- Modern TLS protocols (TLSv1.2, TLSv1.3)
- Strong cipher suite configuration
- HTTP security headers
- Rate limiting
- DDoS protection

## Rate Limiting

The API Gateway implements rate limiting:
- 10 requests per second per IP address
- Burst capability of 20 requests

## Health Checks

Access the health check endpoint at:
```
https://api.ecodex.com/health
```

## Deployment

1. Install Nginx:
   ```bash
   apt-get update
   apt-get install nginx
   ```

2. Copy configuration files:
   ```bash
   cp nginx.conf /etc/nginx/
   cp conf.d/api_gateway.conf /etc/nginx/conf.d/
   ```

3. Test configuration:
   ```bash
   nginx -t
   ```

4. Reload Nginx:
   ```bash
   systemctl reload nginx
   ```

## Monitoring

- Access logs: `/var/log/nginx/access.log`
- Error logs: `/var/log/nginx/error.log`

## Best Practices

1. Regularly update SSL certificates
2. Monitor error logs for issues
3. Keep Nginx updated for security patches
4. Regularly review rate limiting settings
5. Backup configuration files
6. Use version control for configuration changes