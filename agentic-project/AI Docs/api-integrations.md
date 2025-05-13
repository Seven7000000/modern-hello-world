# API Integrations

This document outlines the third-party APIs used in the project and key integration details.

## Payment API

We use Stripe for payment processing.

### Authentication

```python
import stripe
stripe.api_key = os.environ.get("STRIPE_API_KEY")
```

### Creating a Payment Intent

```python
def create_payment_intent(amount, currency="usd"):
    try:
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency=currency,
            automatic_payment_methods={"enabled": True},
        )
        return {"client_secret": intent.client_secret}
    except Exception as e:
        return {"error": str(e)}
```

## Authentication API

We use Auth0 for user authentication.

### Configuration

```javascript
const auth0Config = {
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  audience: process.env.AUTH0_AUDIENCE,
  redirectUri: window.location.origin
};
```

## Data Storage

We use AWS S3 for file storage.

### Configuration

```python
import boto3

s3_client = boto3.client(
    's3',
    aws_access_key_id=os.environ.get('AWS_ACCESS_KEY'),
    aws_secret_access_key=os.environ.get('AWS_SECRET_KEY'),
    region_name='us-east-1'
)
``` 