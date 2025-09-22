from django.shortcuts import render
from django.urls import path

from bank_account.api.artist_account_view import get_artist_payment_view
from bank_account.api.views import list_transactions_view, deposit_view, withdraw_view, transfer_view, \
    get_account_balance_view, client_deposit_view, client_withdraw_view, client_list_transactions_view
from bank_account.api.admin_royalties_view import list_artists_royalties_admin_view

app_name = 'bank_account'


urlpatterns = [
    # path('<str:account_id>/transactions/', list_transactions_view, name='bankaccount-transactions'),
    # path('<str:user_id>/client-transactions/', client_list_transactions_view, name='client-bankaccount-transactions'),
    # path('<str:account_id>/balance/', get_account_balance_view, name='bankaccount-balance'),
    # path('<str:account_id>/deposit/', deposit_view, name='bankaccount-deposit'),
    # path('<str:user_id>/client-deposit/', client_deposit_view, name='client-bankaccount-deposit'),
    # path('<str:user_id>/client-withdraw/', client_withdraw_view, name='client-bankaccount-withdraw'),
    # path('<str:account_id>/withdraw/', withdraw_view, name='bankaccount-withdraw'),
    # path('<str:account_id>/transfer/', transfer_view, name='bankaccount-transfer'),
    ##############


    path('artist/payments/', get_artist_payment_view, name='get_artist_payment_view'),
    path('admin/artists-royalties/', list_artists_royalties_admin_view, name='list_artists_royalties_admin_view')

]
