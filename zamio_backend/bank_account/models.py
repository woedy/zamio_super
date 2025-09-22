from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models.signals import pre_save

from core.utils import unique_account_id_generator



class BankAccount(models.Model):

    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name='bank_accounts')
    account_id = models.CharField(max_length=20, unique=True)
    balance = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)

    currency = models.CharField(max_length=50, blank=True, null=True, default="Ghc")

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} - {self.account_id}"

    def deposit(self, amount, description=None):
        if amount > 0:
            self.balance += amount
            self.save()
            Transaction.objects.create(
                bank_account=self,
                transaction_type='Deposit',
                amount=amount,
                description=description
            )
            return True
        return False

    def withdraw(self, amount, description=None):
        if 0 < amount <= self.balance:
            self.balance -= amount
            self.save()
            Transaction.objects.create(
                bank_account=self,
                transaction_type='Withdrawal',
                amount=amount,
                status="Paid",
                description=description
            )
            return True
        return False

def pre_save_account_id_receiver(sender, instance, *args, **kwargs):
    if not instance.account_id:
        instance.account_id = unique_account_id_generator(instance)

pre_save.connect(pre_save_account_id_receiver, sender=BankAccount)

class Transaction(models.Model):

    STATUS_TYPE = (
    ('Requested', 'Requested'),
    ('Paid', 'Paid'),
    ('Declined', 'Declined')

    )


    TRANSACTION_TYPES = [
        ('Deposit', 'Deposit'),
        ('Withdrawal', 'Withdrawal'),
        ('Transfer', 'Transfer'),
    ]


    PAYMENT_TYPE = [
        ('MTN MoMo', 'MTN MoMo'),
        ('Bank Transfer', 'Bank Transfer'),
    ]

    bank_account = models.ForeignKey(BankAccount, on_delete=models.CASCADE, related_name='transactions')
    transaction_id = models.CharField(max_length=20, unique=True)
    status = models.CharField(max_length=100, choices=STATUS_TYPE, blank=True, null=True)
    payment_method = models.CharField(max_length=100, choices=PAYMENT_TYPE, blank=True, null=True)

    currency = models.CharField(max_length=50, blank=True, null=True, default="Ghc")


    requested_on = models.DateTimeField(blank=True, null=True)
    paid_on = models.DateTimeField(blank=True, null=True)
    declined_on = models.DateTimeField(blank=True, null=True)
    date_processed = models.DateTimeField(blank=True, null=True)


    transaction_type = models.CharField(max_length=50, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    timestamp = models.DateTimeField(default=timezone.now)
    description = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.transaction_id} - {self.bank_account.account_id} - {self.transaction_type} - {self.amount}"



def pre_save_transaction_id_receiver(sender, instance, *args, **kwargs):
    if not instance.transaction_id:
        instance.transaction_id = unique_transaction_id_generator(instance)

pre_save.connect(pre_save_transaction_id_receiver, sender=Transaction)



import uuid

def unique_transaction_id_generator(instance):
    return f"TXN-{uuid.uuid4().hex[:10].upper()}"
