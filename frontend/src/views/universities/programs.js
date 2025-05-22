// import React, { useState, useEffect } from 'react';
// import { Helmet } from 'react-helmet';
// import { Link } from 'react-router-dom';
// import Navbar from '../../components/navbar';
// import Footer from '../../components/footer';
// import FilterSection from '../../components/filter-section';
// import UniversityPresentation from '../../components/university-presentation';
// import './programs.css';

// const Programs = () => {
//   const [universities, setUniversities] = useState([]);
//   const [filteredUniversities, setFilteredUniversities] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
  
//   // State pentru filtre
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterType, setFilterType] = useState('');
//   const [filterLocation, setFilterLocation] = useState('');
//   const [sortBy, setSortBy] = useState('name');
  
//   // Opțiuni pentru filtre
//   const typeOptions = ['Public', 'Private'];
//   const locationOptions = ['Chișinău', 'Bălți', 'Comrat', 'Tiraspol'];

//   useEffect(() => {
//     const fetchUniversities = async () => {
//       try {
//         const response = await fetch('http://localhost:4000/api/universities');
//         if (!response.ok) {
//           throw new Error('Failed to fetch universities');
//         }
//         const data = await response.json();
//         setUniversities(data);
//         setFilteredUniversities(data);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUniversities();
//   }, []);

//   // Filtrare și sortare universiți
//   useEffect(() => {
//     let result = [...universities];
    
//     // Filtrare după termen de căutare
//     if (searchTerm) {
//       result = result.filter(uni => 
//         uni.name.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }
    
//     // Filtrare după tip
//     if (filterType) {
//       result = result.filter(uni => uni.type === filterType);
//     }
    
//     // Filtrare după locație
//     if (filterLocation) {
//       result = result.filter(uni => uni.location === filterLocation);
//     }
    
//     // Sortare
//     switch (sortBy) {
//       case 'name':
//         result.sort((a, b) => a.name.localeCompare(b.name));
//         break;
//       case 'type':
//         result.sort((a, b) => a.type.localeCompare(b.type));
//         break;
//       case 'location':
//         result.sort((a, b) => a.location.localeCompare(b.location));
//         break;
//       default:
//         break;
//     }
    
//     setFilteredUniversities(result);
//   }, [universities, searchTerm, filterType, filterLocation, sortBy]);

//   if (loading) {
//     return (
//       <div className="programs-container">
//         <Navbar />
//         <div className="programs-loading">Loading programs...</div>
//         <Footer />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="programs-container">
//         <Navbar />
//         <div className="error">Error: {error}</div>
//         <Footer />
//       </div>
//     );
//   }

//   return (
//     <div className="programs-container">
//       <Helmet>
//         <title>Programs - Study In Moldova</title>
//         <meta property="og:title" content="Programs - Study In Moldova" />
//       </Helmet>
//       <Navbar />
//       <div className="programs-header">
//         <h1 className="programs-title">Study Programs in Moldova</h1>
//         <p className="programs-description">Discover all the study programs offered by our partner universities in Moldova</p>
//       </div>
//       <div className="programs-content">
//         <FilterSection 
//           searchTerm={searchTerm}
//           setSearchTerm={setSearchTerm}
//           filterType={filterType}
//           setFilterType={setFilterType}
//           filterLocation={filterLocation}
//           setFilterLocation={setFilterLocation}
//           sortBy={sortBy}
//           setSortBy={setSortBy}
//           typeOptions={typeOptions}
//           locationOptions={locationOptions}
//         />
        
//         <div className="programs-grid">
//           {filteredUniversities.length > 0 ? (
//             filteredUniversities.map(university => (
//               <UniversityPresentation 
//                 key={university.id} 
//                 university={university} 
//               />
//             ))
//           ) : (
//             <p>No programs found matching your criteria.</p>
//           )}
//         </div>
//       </div>
//       <Footer />
//     </div>
//   );
// };

// export default Programs;
