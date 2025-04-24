import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  CreditCardIcon, 
  ShoppingBagIcon, 
  HeartIcon, 
  CogIcon,
  MapPinIcon,
  PencilIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

// Mock user data
const mockUser = {
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  phone: '(555) 123-4567',
  profileImage: null, // null means we'll use a placeholder
  addresses: [
    {
      id: 'addr-1',
      type: 'Home',
      isDefault: true,
      street: '123 Main Street',
      apt: 'Apt 4B',
      city: 'Portland',
      state: 'OR',
      zipCode: '97201',
      country: 'United States'
    },
    {
      id: 'addr-2',
      type: 'Work',
      isDefault: false,
      street: '456 Business Ave',
      apt: 'Suite 300',
      city: 'Portland',
      state: 'OR',
      zipCode: '97204',
      country: 'United States'
    }
  ],
  paymentMethods: [
    {
      id: 'pm-1',
      type: 'Visa',
      isDefault: true,
      lastFour: '4242',
      expiryDate: '05/26'
    },
    {
      id: 'pm-2',
      type: 'Mastercard',
      isDefault: false,
      lastFour: '8888',
      expiryDate: '12/25'
    }
  ],
  recentOrders: [
    {
      id: 'order-1',
      date: '2025-04-10',
      total: 125.99,
      status: 'Delivered',
      items: 3
    },
    {
      id: 'order-2',
      date: '2025-03-28',
      total: 79.50,
      status: 'Processing',
      items: 2
    }
  ],
  favorites: 12,
  memberSince: 'March 2023'
};

// Navigation items for the sidebar
const accountNavItems = [
  { name: 'Profile', href: '/account', icon: UserIcon, current: true },
  { name: 'Orders', href: '/account/orders', icon: ShoppingBagIcon, current: false },
  { name: 'Addresses', href: '/account/addresses', icon: MapPinIcon, current: false },
  { name: 'Payment Methods', href: '/account/payment', icon: CreditCardIcon, current: false },
  { name: 'Favorites', href: '/favorites', icon: HeartIcon, current: false },
  { name: 'Settings', href: '/account/settings', icon: CogIcon, current: false },
];

const AccountPage = () => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: mockUser.name,
    email: mockUser.email,
    phone: mockUser.phone,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the data to an API
    console.log('Form submitted:', formData);
    setIsEditing(false);
    
    // Show success message
    alert('Profile updated successfully!');
  };

  // Handle profile image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-warm-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-charcoal mb-8">My Account</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="relative w-16 h-16 rounded-full bg-sage/10 flex items-center justify-center mr-4 overflow-hidden">
                    {profileImage ? (
                      <Image 
                        src={profileImage} 
                        alt={mockUser.name} 
                        fill 
                        className="object-cover"
                      />
                    ) : (
                      <UserIcon className="w-8 h-8 text-sage" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-medium text-charcoal">{mockUser.name}</h2>
                    <p className="text-sm text-gray-500">Member since {mockUser.memberSince}</p>
                  </div>
                </div>
              </div>
              
              <nav className="p-2">
                {accountNavItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 py-3 text-sm rounded-md ${
                      item.current 
                        ? 'bg-sage/10 text-sage font-medium' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 mr-3 ${item.current ? 'text-sage' : 'text-gray-500'}`} />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium text-charcoal">Profile Information</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-sage hover:text-sage/80 flex items-center text-sm font-medium"
                >
                  <PencilIcon className="w-4 h-4 mr-1" />
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>
              
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-6 mb-6">
                    <div className="md:w-1/3 flex flex-col items-center">
                      <div className="relative w-32 h-32 rounded-full bg-sage/10 flex items-center justify-center overflow-hidden mb-4">
                        {profileImage ? (
                          <Image 
                            src={profileImage} 
                            alt={formData.name} 
                            fill 
                            className="object-cover"
                          />
                        ) : (
                          <UserIcon className="w-16 h-16 text-sage" />
                        )}
                      </div>
                      <label className="px-4 py-2 bg-sage text-white rounded-md cursor-pointer text-sm font-medium hover:bg-sage/90 transition-colors">
                        Change Photo
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                    
                    <div className="md:w-2/3 space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-6">
                    <h3 className="text-lg font-medium text-charcoal mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          id="currentPassword"
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          id="newPassword"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-3 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-sage text-white rounded-md hover:bg-sage/90"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Full Name</h3>
                      <p className="text-charcoal">{mockUser.name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Email Address</h3>
                      <p className="text-charcoal">{mockUser.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Phone Number</h3>
                      <p className="text-charcoal">{mockUser.phone}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Password</h3>
                      <p className="text-charcoal">••••••••</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Addresses Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium text-charcoal">Shipping Addresses</h2>
                <Link 
                  href="/account/addresses" 
                  className="text-sage hover:text-sage/80 flex items-center text-sm font-medium"
                >
                  View All
                  <ArrowRightIcon className="w-4 h-4 ml-1" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockUser.addresses.map((address) => (
                  <div 
                    key={address.id} 
                    className={`p-4 border rounded-md ${address.isDefault ? 'border-sage/50 bg-sage/5' : 'border-gray-200'}`}
                  >
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-charcoal">{address.type}</span>
                      {address.isDefault && (
                        <span className="text-xs bg-sage/20 text-sage px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">{address.street}</p>
                    {address.apt && <p className="text-sm text-gray-700">{address.apt}</p>}
                    <p className="text-sm text-gray-700">{address.city}, {address.state} {address.zipCode}</p>
                    <p className="text-sm text-gray-700">{address.country}</p>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                      <button className="text-sm text-sage hover:text-sage/80 mr-3">Edit</button>
                      {!address.isDefault && (
                        <button className="text-sm text-sage hover:text-sage/80">
                          Set as Default
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Payment Methods Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium text-charcoal">Payment Methods</h2>
                <Link 
                  href="/account/payment" 
                  className="text-sage hover:text-sage/80 flex items-center text-sm font-medium"
                >
                  View All
                  <ArrowRightIcon className="w-4 h-4 ml-1" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockUser.paymentMethods.map((payment) => (
                  <div 
                    key={payment.id} 
                    className={`p-4 border rounded-md ${payment.isDefault ? 'border-sage/50 bg-sage/5' : 'border-gray-200'}`}
                  >
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-charcoal">{payment.type} •••• {payment.lastFour}</span>
                      {payment.isDefault && (
                        <span className="text-xs bg-sage/20 text-sage px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">Expires: {payment.expiryDate}</p>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                      <button className="text-sm text-sage hover:text-sage/80 mr-3">Edit</button>
                      {!payment.isDefault && (
                        <button className="text-sm text-sage hover:text-sage/80">
                          Set as Default
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Recent Orders Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium text-charcoal">Recent Orders</h2>
                <Link 
                  href="/account/orders" 
                  className="text-sage hover:text-sage/80 flex items-center text-sm font-medium"
                >
                  View All Orders
                  <ArrowRightIcon className="w-4 h-4 ml-1" />
                </Link>
              </div>
              
              {mockUser.recentOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Items
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {mockUser.recentOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-charcoal">
                            #{order.id}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                            {new Date(order.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                            {order.items}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                            ${order.total.toFixed(2)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              order.status === 'Delivered' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                            <Link 
                              href={`/account/orders/${order.id}`}
                              className="text-sage hover:text-sage/80"
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingBagIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
<                  <p className="text-gray-500">You haven&apos;t placed any orders yet.</p>
                  <Link 
                    href="/shop" 
                    className="mt-4 inline-block px-4 py-2 bg-sage text-white rounded-md text-sm font-medium hover:bg-sage/90"
                  >
                    Start Shopping
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
