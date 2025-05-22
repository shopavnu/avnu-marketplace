import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import {
  ArrowLeftIcon,
  PrinterIcon,
  PaperAirplaneIcon,
  TruckIcon,
  BanknotesIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import MerchantLayout from "@/components/merchant/MerchantLayout";

// Mock order data - in a real app, this would be fetched from an API
const orderData = {
  id: "ORD-10003",
  customerName: "Michael Brown",
  customerEmail: "michael.brown@example.com",
  customerPhone: "(555) 123-4567",
  date: "2025-04-17T11:45:00",
  total: 210.75,
  subtotal: 195.0,
  tax: 15.75,
  shipping: 0,
  discount: 0,
  status: "Shipped",
  paymentStatus: "Paid",
  paymentMethod: "Credit Card (Visa ending in 4242)",
  shippingMethod: "Standard Shipping",
  trackingNumber: "1Z999AA10123456784",
  trackingUrl: "https://www.ups.com/track?tracknum=1Z999AA10123456784",
  shippingAddress: {
    name: "Michael Brown",
    line1: "123 Main Street",
    line2: "Apt 4B",
    city: "Portland",
    state: "OR",
    postalCode: "97201",
    country: "United States",
  },
  billingAddress: {
    name: "Michael Brown",
    line1: "123 Main Street",
    line2: "Apt 4B",
    city: "Portland",
    state: "OR",
    postalCode: "97201",
    country: "United States",
  },
  items: [
    {
      id: "PROD-003",
      name: "Recycled Denim Jacket",
      sku: "RDJ-001-M",
      price: 79.99,
      quantity: 1,
      image: null,
      total: 79.99,
    },
    {
      id: "PROD-007",
      name: "Organic Linen Dress",
      sku: "OLD-002-S",
      price: 89.99,
      quantity: 1,
      image: null,
      total: 89.99,
    },
    {
      id: "PROD-005",
      name: "Sustainable Yoga Mat",
      sku: "SYM-001",
      price: 39.99,
      quantity: 1,
      image: null,
      total: 39.99,
    },
  ],
  notes: "Customer requested gift wrapping for the dress.",
  timeline: [
    {
      id: 1,
      status: "Order Placed",
      date: "2025-04-17T11:45:00",
      description: "Order was placed by customer",
    },
    {
      id: 2,
      status: "Payment Confirmed",
      date: "2025-04-17T11:46:00",
      description: "Payment was successfully processed",
    },
    {
      id: 3,
      status: "Processing",
      date: "2025-04-17T14:30:00",
      description: "Order is being prepared for shipping",
    },
    {
      id: 4,
      status: "Shipped",
      date: "2025-04-18T09:15:00",
      description: "Order has been shipped via UPS",
    },
  ],
};

const OrderDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [orderStatus, setOrderStatus] = useState(orderData.status);
  const [orderNote, setOrderNote] = useState("");

  // In a real app, this would fetch the order data based on the ID
  // For now, we'll use the mock data

  const handleUpdateStatus = async (newStatus: string) => {
    setIsUpdatingStatus(true);

    try {
      // This would be an API call in a real app
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setOrderStatus(newStatus);

      // Add to timeline
      const now = new Date().toISOString();
      orderData.timeline.push({
        id: orderData.timeline.length + 1,
        status: newStatus,
        date: now,
        description: `Order status updated to ${newStatus}`,
      });

      alert(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderNote.trim()) return;

    try {
      // This would be an API call in a real app
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Add to timeline
      const now = new Date().toISOString();
      orderData.timeline.push({
        id: orderData.timeline.length + 1,
        status: "Note Added",
        date: now,
        description: orderNote,
      });

      setOrderNote("");
      alert("Note added successfully");
    } catch (error) {
      console.error("Error adding note:", error);
      alert("Failed to add note");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Processing":
        return "bg-blue-100 text-blue-800";
      case "Shipped":
        return "bg-purple-100 text-purple-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Awaiting Payment":
        return "bg-yellow-100 text-yellow-800";
      case "Refunded":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <Head>
        <title>Order {id} | Merchant Portal | av|nu</title>
        <meta name="description" content={`Order details for ${id}`} />
      </Head>

      <MerchantLayout>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => router.back()}
                className="mr-4 text-gray-400 hover:text-gray-500"
              >
                <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">Back</span>
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">
                Order {orderData.id}
              </h1>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage"
              >
                <PrinterIcon
                  className="-ml-1 mr-2 h-5 w-5 text-gray-500"
                  aria-hidden="true"
                />
                Print Invoice
              </button>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sage hover:bg-sage/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage"
              >
                <PaperAirplaneIcon
                  className="-ml-1 mr-2 h-5 w-5"
                  aria-hidden="true"
                />
                Email Customer
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Order Summary */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Status */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      Order Status
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Current status and actions for this order.
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(orderStatus)}`}
                    >
                      {orderStatus}
                    </span>
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(orderData.paymentStatus)}`}
                    >
                      {orderData.paymentStatus}
                    </span>
                  </div>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={
                        isUpdatingStatus || orderStatus === "Processing"
                      }
                      onClick={() => handleUpdateStatus("Processing")}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      Mark as Processing
                    </button>
                    <button
                      type="button"
                      disabled={isUpdatingStatus || orderStatus === "Shipped"}
                      onClick={() => handleUpdateStatus("Shipped")}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                    >
                      <TruckIcon
                        className="-ml-0.5 mr-2 h-4 w-4"
                        aria-hidden="true"
                      />
                      Mark as Shipped
                    </button>
                    <button
                      type="button"
                      disabled={isUpdatingStatus || orderStatus === "Delivered"}
                      onClick={() => handleUpdateStatus("Delivered")}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      <CheckCircleIcon
                        className="-ml-0.5 mr-2 h-4 w-4"
                        aria-hidden="true"
                      />
                      Mark as Delivered
                    </button>
                    <button
                      type="button"
                      disabled={isUpdatingStatus || orderStatus === "Cancelled"}
                      onClick={() => handleUpdateStatus("Cancelled")}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      <XCircleIcon
                        className="-ml-0.5 mr-2 h-4 w-4"
                        aria-hidden="true"
                      />
                      Cancel Order
                    </button>
                  </div>

                  {orderData.trackingNumber && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-500">
                        Tracking Information
                      </p>
                      <div className="mt-2 flex items-center text-sm text-gray-900">
                        <TruckIcon
                          className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                        <span>{orderData.trackingNumber}</span>
                        {orderData.trackingUrl && (
                          <a
                            href={orderData.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-sage hover:text-sage/80"
                          >
                            Track Package
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Order Items
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    {orderData.items.length} items in this order.
                  </p>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <div className="flow-root">
                    <ul className="-my-6 divide-y divide-gray-200">
                      {orderData.items.map((item) => (
                        <li key={item.id} className="py-6 flex">
                          <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name}
                                width={96}
                                height={96}
                                className="w-full h-full object-center object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <span className="text-xs text-gray-500">
                                  No image
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="ml-4 flex-1 flex flex-col">
                            <div>
                              <div className="flex justify-between text-base font-medium text-gray-900">
                                <h3>
                                  <Link
                                    href={`/merchant/products/${item.id}`}
                                    className="hover:text-sage"
                                  >
                                    {item.name}
                                  </Link>
                                </h3>
                                <p className="ml-4">${item.total.toFixed(2)}</p>
                              </div>
                              <p className="mt-1 text-sm text-gray-500">
                                SKU: {item.sku}
                              </p>
                            </div>
                            <div className="flex-1 flex items-end justify-between text-sm">
                              <p className="text-gray-500">
                                Qty {item.quantity}
                              </p>
                              <div className="flex">
                                <Link
                                  href={`/merchant/products/${item.id}`}
                                  className="font-medium text-sage hover:text-sage/80"
                                >
                                  View Product
                                </Link>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="px-4 py-5 sm:px-6 bg-gray-50 border-t border-gray-200">
                  <div className="flow-root">
                    <div className="flex justify-between text-sm">
                      <p className="text-gray-700">Subtotal</p>
                      <p className="font-medium text-gray-900">
                        ${orderData.subtotal.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <p className="text-gray-700">Shipping</p>
                      <p className="font-medium text-gray-900">
                        {orderData.shipping === 0
                          ? "Free"
                          : `$${orderData.shipping.toFixed(2)}`}
                      </p>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <p className="text-gray-700">Tax</p>
                      <p className="font-medium text-gray-900">
                        ${orderData.tax.toFixed(2)}
                      </p>
                    </div>
                    {orderData.discount > 0 && (
                      <div className="flex justify-between text-sm mt-2">
                        <p className="text-gray-700">Discount</p>
                        <p className="font-medium text-green-600">
                          -${orderData.discount.toFixed(2)}
                        </p>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-medium mt-4 pt-4 border-t border-gray-200">
                      <p className="text-gray-900">Total</p>
                      <p className="text-gray-900">
                        ${orderData.total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer and Order Details Sidebar */}
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Customer
                  </h3>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">
                      {orderData.customerName}
                    </p>
                    <p className="text-gray-500 mt-1">
                      {orderData.customerEmail}
                    </p>
                    {orderData.customerPhone && (
                      <p className="text-gray-500 mt-1">
                        {orderData.customerPhone}
                      </p>
                    )}
                    <div className="mt-4">
                      <Link
                        href="#"
                        className="text-sage hover:text-sage/80 text-sm font-medium"
                      >
                        View Customer Profile
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Payment
                  </h3>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <BanknotesIcon
                      className="h-5 w-5 text-gray-400 mr-2"
                      aria-hidden="true"
                    />
                    <span className="text-sm text-gray-900">
                      {orderData.paymentMethod}
                    </span>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500">
                      Billing Address
                    </p>
                    <div className="mt-2 text-sm text-gray-900">
                      <p>{orderData.billingAddress.name}</p>
                      <p>{orderData.billingAddress.line1}</p>
                      {orderData.billingAddress.line2 && (
                        <p>{orderData.billingAddress.line2}</p>
                      )}
                      <p>
                        {orderData.billingAddress.city},{" "}
                        {orderData.billingAddress.state}{" "}
                        {orderData.billingAddress.postalCode}
                      </p>
                      <p>{orderData.billingAddress.country}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Shipping
                  </h3>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <TruckIcon
                      className="h-5 w-5 text-gray-400 mr-2"
                      aria-hidden="true"
                    />
                    <span className="text-sm text-gray-900">
                      {orderData.shippingMethod}
                    </span>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500">
                      Shipping Address
                    </p>
                    <div className="mt-2 text-sm text-gray-900">
                      <p>{orderData.shippingAddress.name}</p>
                      <p>{orderData.shippingAddress.line1}</p>
                      {orderData.shippingAddress.line2 && (
                        <p>{orderData.shippingAddress.line2}</p>
                      )}
                      <p>
                        {orderData.shippingAddress.city},{" "}
                        {orderData.shippingAddress.state}{" "}
                        {orderData.shippingAddress.postalCode}
                      </p>
                      <p>{orderData.shippingAddress.country}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Notes */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Notes
                  </h3>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  {orderData.notes ? (
                    <p className="text-sm text-gray-900">{orderData.notes}</p>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      No notes for this order.
                    </p>
                  )}

                  <form onSubmit={handleAddNote} className="mt-4">
                    <label
                      htmlFor="note"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Add a note
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="note"
                        name="note"
                        rows={3}
                        className="shadow-sm focus:ring-sage focus:border-sage block w-full sm:text-sm border-gray-300 rounded-md"
                        value={orderNote}
                        onChange={(e) => setOrderNote(e.target.value)}
                        placeholder="Add a note about this order..."
                      />
                    </div>
                    <div className="mt-2 flex justify-end">
                      <button
                        type="submit"
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-sage hover:bg-sage/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage"
                      >
                        Add Note
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Order Timeline
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                History of activities for this order.
              </p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="flow-root">
                <ul className="-mb-8">
                  {orderData.timeline.map((event, eventIdx) => (
                    <li key={event.id}>
                      <div className="relative pb-8">
                        {eventIdx !== orderData.timeline.length - 1 ? (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-sage flex items-center justify-center ring-8 ring-white">
                              <CheckCircleIcon
                                className="h-5 w-5 text-white"
                                aria-hidden="true"
                              />
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-900">
                                {event.status}{" "}
                                <span className="font-medium text-gray-700">
                                  {event.description}
                                </span>
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              <time dateTime={event.date}>
                                {new Date(event.date).toLocaleString()}
                              </time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </MerchantLayout>
    </>
  );
};

export default OrderDetailPage;
