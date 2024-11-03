import React, { useState, useRef, useEffect } from 'react';

const CustomCountryDropdown = ({ data, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(
    data.find(country => country.dial_code === value) || data[0]
  );
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (country) => {
    setSelectedCountry(country);
    onChange({ target: { value: country.dial_code, name: 'countryCode' } });
    setIsOpen(false);
    setSearchTerm('');
  };

  const filteredData = data.filter(country => 
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.dial_code.includes(searchTerm)
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    const matchingCountry = data.find(country => 
      country.dial_code.startsWith(e.target.value)
    );
    if (matchingCountry) {
      const listItem = document.getElementById(`country-${matchingCountry.code}`);
      if (listItem) listItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  return (
    <div className="custom-dropdown" ref={dropdownRef}>
      <button 
        className="dropdown-toggle" 
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <img 
          src={`https://flagsapi.com/${selectedCountry.code}/flat/64.png`} 
          alt={selectedCountry.name} 
          width="20" 
          height="20"
        />
        <span className='text-black'>{selectedCountry.dial_code}</span>
      </button>
      {isOpen && (
        <div className="dropdown-menu">
          <input
            type="text"
            className="form-control"
            placeholder="Search country or code"
            value={searchTerm}
            onChange={handleSearchChange}
            // className="dropdown-search"
            ref={searchInputRef}
          />
          <ul>
            {filteredData.map((country, index) => (
              <li 
                key={index} 
                onClick={() => handleSelect(country)}
                id={`country-${country.code}`}
              >
                <img 
                  src={`https://flagsapi.com/${country.code}/flat/64.png`} 
                  alt={country.name} 
                  width="20" 
                  height="20"
                />
                <span className="text-black">{country.dial_code}</span>
                <span className="country-name text-black">{country.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <style jsx>{`
        .custom-dropdown {
          position: relative;
          display: inline-block;
        }
        .dropdown-toggle {
          display: flex;
          align-items: center;
          padding: 5px 10px;
          background-color: #f8f9fa;
          border: 1px solid #ced4da;
          border-radius: 4px;
          cursor: pointer;
        }
        .dropdown-toggle img {
          margin-right: 5px;
        }
        .dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          z-index: 1000;
          display: block;
          width: 300px;
          padding: 5px 0;
          margin: 2px 0 0;
          background-color: #fff;
          border: 1px solid rgba(0,0,0,.15);
          border-radius: 4px;
          box-shadow: 0 6px 12px rgba(0,0,0,.175);
        }
        .dropdown-search {
          width: 100%;
          padding: 5px;
          margin-bottom: 5px;
          border: 1px solid #ced4da;
          border-radius: 4px;
        }
        .dropdown-menu ul {
          list-style: none;
          padding: 0;
          margin: 0;
          max-height: 200px;
          overflow-y: auto;
        }
        .dropdown-menu li {
          display: flex;
          align-items: center;
          padding: 5px 10px;
          cursor: pointer;
        }
        .dropdown-menu li:hover {
          background-color: #f5f5f5;
        }
        .dropdown-menu img {
          margin-right: 10px;
        }
        .country-name {
          margin-left: 10px;
          color: #6c757d;
        }
      `}</style>
    </div>
  );
};

export default CustomCountryDropdown;