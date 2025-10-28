import React, { useState } from 'react';
// import { Newspaper, X } from 'lucide-react';
import ViewNews from './ViewNews';

const NewsButton = () => {
  const [isNewsOpen, setIsNewsOpen] = useState(false);

  return (
    <>
      <ViewNews 
        isOpen={isNewsOpen} 
        onClose={() => setIsNewsOpen(false)} 
      />
    </>
  );
};

export default NewsButton;

