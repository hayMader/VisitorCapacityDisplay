import React from 'react';

const Footer: React.FC = () => {

// Footer component to display the copyright information
  return (
    <footer className="bg-white border-t py-4">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Messe München GmbH - Management System</p> 
      </div>
    </footer>
  );
};

export default Footer;