import { useState, useEffect } from 'react';

interface College {
  id: number;
  college: string;
  state: string;
  district: string;
}

export const useCollegeSearch = (searchQuery: string, state?: string) => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchColleges = async () => {
      if (searchQuery.length < 2) {
        setColleges([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Using the Indian Colleges API
        let url = `https://colleges-api.onrender.com/colleges?search=${encodeURIComponent(searchQuery)}`;
        if (state) {
          // Format state name for API (lowercase, replace spaces with hyphens)
          const formattedState = state.toLowerCase().replace(/\s+/g, '-');
          url = `https://colleges-api.onrender.com/colleges/${formattedState}?search=${encodeURIComponent(searchQuery)}`;
        }

        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch colleges');
        }

        const data = await response.json();
        setColleges(Array.isArray(data) ? data.slice(0, 50) : []);
      } catch (err) {
        console.error('Error fetching colleges:', err);
        setError('Unable to fetch colleges. Please type your college name manually.');
        setColleges([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchColleges, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, state]);

  return { colleges, isLoading, error };
};

// Popular universities as fallback
export const POPULAR_UNIVERSITIES = [
  "Indian Institute of Technology (IIT) Delhi",
  "Indian Institute of Technology (IIT) Bombay",
  "Indian Institute of Technology (IIT) Madras",
  "Indian Institute of Technology (IIT) Kanpur",
  "Indian Institute of Technology (IIT) Kharagpur",
  "Indian Institute of Technology (IIT) Roorkee",
  "Indian Institute of Technology (IIT) Guwahati",
  "Indian Institute of Technology (IIT) Hyderabad",
  "Indian Institute of Science (IISc) Bangalore",
  "National Institute of Technology (NIT) Trichy",
  "National Institute of Technology (NIT) Warangal",
  "National Institute of Technology (NIT) Surathkal",
  "National Institute of Technology (NIT) Calicut",
  "BITS Pilani",
  "BITS Hyderabad",
  "BITS Goa",
  "Delhi University",
  "Mumbai University",
  "Anna University",
  "Jawaharlal Nehru University (JNU)",
  "Banaras Hindu University (BHU)",
  "Aligarh Muslim University (AMU)",
  "VIT Vellore",
  "SRM University",
  "Amity University",
  "Manipal University",
  "KIIT Bhubaneswar",
  "Symbiosis International University",
  "Christ University",
  "Lovely Professional University",
  "Shiv Nadar University",
  "Ashoka University",
  "OP Jindal Global University",
  "IISER Pune",
  "IISER Kolkata",
  "IISER Mohali",
  "IIIT Hyderabad",
  "IIIT Delhi",
  "IIIT Bangalore",
  "Jadavpur University",
  "Calcutta University",
  "Madras University",
  "Osmania University",
  "Savitribai Phule Pune University",
  "Bangalore University",
  "Gujarat University",
  "Rajasthan University",
  "Punjab University",
  "Jamia Millia Islamia",
  "Indian Statistical Institute (ISI)"
];
