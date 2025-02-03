# Cloud Hosting Price Comparison
 About 1000 monthly users visiting in a staggered form

## Use Case Overview
- Monthly Active Users: ~1000
- Traffic Pattern: Random, staggered visits
- Features: QR code scanning, user registration, data storage
- Stack: React frontend, Spring Boot backend

## Frontend Hosting (React SPA)

### Free Tier Options (Recommended)
| Service    | Bandwidth    | Build Minutes | Features                   | Price    |
|------------|-------------|---------------|----------------------------|----------|
| Netlify    | 100GB/month | 300/month     | CDN, SSL, CI/CD           | $0/month |
| Vercel     | 100GB/month | 400/month     | CDN, SSL, CI/CD           | $0/month |
| Render     | Unlimited   | 400/month     | CDN, SSL, Auto-deploy     | $0/month |

## Backend Hosting (Spring Boot)

### Traditional Fixed-Price Options

#### Render
| Tier      | RAM   | CPU  | Features             | Price/Month |
|-----------|-------|------|----------------------|-------------|
| Starter   | 512MB | 0.5  | SSL, Zero Downtime   | $7         |
| Standard  | 2GB   | 1.0  | + Better performance | $25        |
| Plus      | 4GB   | 2.0  | + More resources     | $85        |


### Pay-Per-Use Option (GCP Cloud Run)

#### Pricing Structure
- vCPU: $0.00001800/second used
- Memory: $0.00000200/GB-second used
- Free tier: 240,000 vCPU-seconds/month
- Free tier: 450,000 GB-seconds/month

#### Scenario A: Pure Pay-Per-Use
For 1000 users/month with 4-second average session:
- Total compute time: 4000 seconds
- Estimated cost: $5-10/month
- Cold start delay: 200ms-300ms

#### Scenario B: Always-On (1 instance)
Running 24/7 for instant access:
- Monthly cost: ~$52.81
- No cold start delay
- Predictable performance

## Database Options

### SQL Databases (PostgreSQL)
| Service          | Storage | Features         | Price/Month |
|-----------------|----------|-----------------|-------------|
| Railway         | 1GB      | Auto-backups    | $5-7        |
| Render          | 1GB      | Daily backups   | $7          |
| GCP SQL         | 10GB     | Fully managed   | $10+        |
| Heroku Postgres | 1GB      | Basic           | $5          |

### NoSQL Databases (MongoDB)
| Service          | Storage | Features         | Price/Month |
|-----------------|----------|-----------------|-------------|
| MongoDB Atlas    | 512MB    | Free tier       | $0          |
| MongoDB Atlas M2 | 2GB      | Dedicated       | $9          |
| GCP Datastore   | Pay/use  | Serverless      | $5-7        |

## Recommended Configurations

### Budget Option ($7/month)
- Frontend: Netlify (Free)
- Backend: Render Basic ($7)
- Database: MongoDB Atlas Free Tier ($0)

  
**Total: $7/month**

### Balanced Option ($34/month)
- Frontend: Vercel (Free)
- Backend: Render Standard ($25)
- Database: MongoDB Atlas M2 ($9)

  
**Total: $34/month**

### GCP Cloud Run Options

#### Serverless Setup ($10-15/month)
- Frontend: Netlify (Free)
- Backend: Cloud Run Pay-per-use ($5-10)
- Database: MongoDB Atlas Free Tier ($0)

  
**Total: $5-10/month**
*Note: Includes cold starts*

#### Always-On Setup ($60-65/month)
- Frontend: Netlify (Free)
- Backend: Cloud Run Always-on ($52.81)
- Database: MongoDB Atlas M2 ($9)

  
**Total: $61.81/month**
*Note: No cold starts*
