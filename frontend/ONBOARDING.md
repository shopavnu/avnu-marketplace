# av | nu Marketplace - Developer Onboarding Guide

Welcome to the av | nu Marketplace development team! This guide is designed to help you get up to speed quickly and effectively with our codebase, architecture, and development practices.

## 🚀 Quick Start (15 minutes)

1. **Setup your environment**
   ```bash
   # Clone the repository
   git clone [repository-url]
   
   # Navigate to the project directory
   cd av-nu-marketplace
   
   # Install dependencies
   npm install
   
   # Start the development server
   npm run dev
   ```

2. **Open in your browser**
   - Visit [http://localhost:3000](http://localhost:3000) to see the application
   - Try navigating to different pages:
     - Home: `/`
     - Shop: `/shop`
     - Brand detail: `/brand/terra-clay`
     - Product detail: `/product/1`
     - Brand application: `/for-brands`

3. **Explore the code structure**
   - Check out the `src/components` directory to see our component library
   - Look at `src/pages` to understand our page structure
   - Review `src/types` to understand our data models

## 📚 Learning Path (First Week)

### Day 1: Project Overview and Setup
- [ ] Read the [README.md](./README.md) for a high-level overview
- [ ] Set up your local development environment
- [ ] Run the application and explore the UI
- [ ] Review the project structure

### Day 2: Architecture and Design Patterns
- [ ] Study the [ARCHITECTURE.md](./ARCHITECTURE.md) document
- [ ] Understand the component-based architecture
- [ ] Review the state management approach
- [ ] Explore the styling system with Tailwind CSS

### Day 3: Component Library
- [ ] Read the [COMPONENTS.md](./COMPONENTS.md) document
- [ ] Explore key components in the codebase:
  - [ ] Layout components (`src/components/layout`)
  - [ ] Product components (`src/components/products`)
  - [ ] Brand components (`src/components/brands`)
- [ ] Try modifying a simple component to understand the workflow

### Day 4: Data Flow and State Management
- [ ] Understand how data flows through the application
- [ ] Explore the mock data in `src/data`
- [ ] Review the type definitions in `src/types`
- [ ] Understand how state is managed in different components

### Day 5: Feature Deep Dive
- [ ] Pick one feature (e.g., shopping cart, brand application, product listing)
- [ ] Trace the feature from UI to data layer
- [ ] Make a small enhancement to the feature
- [ ] Get feedback from the team on your implementation

## 🔍 Key Concepts Reference

### Project Philosophy
The av | nu Marketplace is built on these core principles:
- **Minimalist Design**: Clean, focused UI with sage as the primary accent color
- **Independent Brand Focus**: Highlighting unique, independent brands
- **Sustainable Commerce**: Emphasizing sustainable and ethical products
- **User-Centric Experience**: Intuitive navigation and seamless shopping experience

### Tech Stack Quick Reference
- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: React Hooks and Context
- **Mock Data**: JSON files in `src/data`

### Directory Structure Cheat Sheet
```
src/
├── components/         # Reusable UI components
│   ├── brands/         # Brand-related components
│   ├── cart/           # Shopping cart components
│   ├── common/         # Shared utility components
│   ├── home/           # Homepage components
│   ├── layout/         # Layout components
│   ├── products/       # Product-related components
│   └── search/         # Search components
├── data/               # Mock data
├── pages/              # Next.js pages
├── styles/             # Global styles
└── types/              # TypeScript definitions
```

### Key Files to Know
- `src/pages/_app.tsx`: Application entry point
- `src/components/layout/Layout.tsx`: Main layout wrapper
- `src/components/layout/Header.tsx`: Navigation and user controls
- `src/pages/index.tsx`: Homepage implementation
- `src/pages/for-brands.tsx`: Brand application page

## 💡 Common Tasks Reference

### Adding a New Component
1. Create a new file in the appropriate directory under `src/components`
2. Define the component with TypeScript props interface
3. Implement the component using Tailwind CSS for styling
4. Export the component
5. Import and use it where needed

Example:
```tsx
// src/components/common/Button.tsx
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  onClick 
}) => {
  const baseClasses = "px-4 py-2 rounded-full font-montserrat transition-colors";
  const variantClasses = {
    primary: "bg-sage text-white hover:bg-sage/90",
    secondary: "bg-white text-sage border-2 border-sage hover:bg-sage/10",
    outline: "border-2 border-sage text-sage hover:bg-sage hover:text-white"
  };
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

### Adding a New Page
1. Create a new file in `src/pages` directory
2. Implement the page component
3. Use the Layout component to maintain consistent structure
4. Add navigation links if needed

Example:
```tsx
// src/pages/sustainability.tsx
import { NextPage } from 'next';
import Layout from '../components/layout/Layout';
import { motion } from 'framer-motion';

const SustainabilityPage: NextPage = () => {
  return (
    <Layout>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-12"
      >
        <h1 className="text-4xl font-montserrat font-bold text-charcoal mb-8">
          Our Commitment to Sustainability
        </h1>
        {/* Page content */}
      </motion.div>
    </Layout>
  );
};

export default SustainabilityPage;
```

### Modifying Styles
1. Styles are primarily managed through Tailwind CSS classes
2. Check the [Tailwind documentation](https://tailwindcss.com/docs) for available classes
3. For custom styles, you can extend the Tailwind config or use CSS modules

### Working with Data
1. For now, mock data is stored in `src/data` directory
2. Modify the data files to add or change content
3. In a production environment, this would be replaced with API calls

## 🧪 Testing Your Changes

### Running Tests
```bash
# Run unit tests
npm test

# Run specific test file
npm test -- components/Button.test.tsx
```

### Manual Testing Checklist
- [ ] Test on multiple screen sizes (mobile, tablet, desktop)
- [ ] Check keyboard navigation and tab order
- [ ] Verify that animations work as expected
- [ ] Test with different browsers (Chrome, Firefox, Safari)
- [ ] Check for console errors

## 🤝 Collaboration Guidelines

### Git Workflow
1. Create a new branch for your feature or fix
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes and commit with descriptive messages
3. Push your branch and create a pull request
4. Request reviews from team members

### Code Style
- Follow the existing code style and patterns
- Use TypeScript for type safety
- Write meaningful component and function names
- Add comments for complex logic
- Keep components focused and single-responsibility

### Pull Request Process
1. Describe what your PR does and why
2. Link to any related issues
3. Include screenshots for UI changes
4. Ensure all tests pass
5. Address review comments promptly

## 🆘 Getting Help

### Common Issues and Solutions

#### Next.js Hot Reload Not Working
- Check if you have modified the `next.config.js` file
- Restart the development server
- Clear your browser cache

#### TypeScript Errors
- Make sure your types are correctly defined
- Check for null or undefined values
- Use optional chaining (`?.`) for potentially undefined properties

#### Styling Issues
- Verify Tailwind classes are correct
- Check for conflicting styles
- Use browser dev tools to inspect elements

### Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

### Team Contacts

- **Frontend Lead**: [Name] - [Contact Info]
- **Design Lead**: [Name] - [Contact Info]
- **Project Manager**: [Name] - [Contact Info]

## 📈 Next Steps After Onboarding

Once you're comfortable with the codebase, consider:

1. **Taking on a small feature**: Pick an issue from the backlog to implement
2. **Improving documentation**: Add to or clarify existing documentation
3. **Optimizing performance**: Look for opportunities to improve loading times or reduce bundle size
4. **Adding tests**: Increase test coverage for components or utilities
5. **Proposing enhancements**: Share your ideas for improving the user experience

---

We're excited to have you on the team! This onboarding guide is designed to help you get up to speed quickly, but don't hesitate to ask questions and seek guidance from other team members.

Happy coding! 🎉
