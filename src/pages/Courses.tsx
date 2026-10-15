import { useState, useEffect } from 'react';
import { CourseGrid } from '../components/ui/course-grid';
import { Input } from '../components/ui/input';
import { Search, Loader2, Video, FileText, Layers, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { getPublishedCourses } from '../lib/db';
import { Course } from '../types';
import { useSearchParams } from 'react-router-dom';

export function Courses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get('category') || null);
  const [selectedType, setSelectedType] = useState<string>(searchParams.get('type') || 'all');
  const [sortBy, setSortBy] = useState<string>('recommended');

  useEffect(() => {
    async function loadCourses() {
      try {
        const fetchedCourses = await getPublishedCourses();
        setCourses(fetchedCourses);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  const categories = Array.from(new Set(courses.map(c => c.category).filter(Boolean)));

  const filteredCourses = courses.filter(course => {
    const titleMatch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const descMatch = (course.shortDescription || '').toLowerCase().includes(searchQuery.toLowerCase());
    const instructorMatch = (course.instructor || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = titleMatch || descMatch || instructorMatch;
    
    const matchesCategory = selectedCategory ? course.category === selectedCategory : true;
    
    let matchesType = true;
    if (selectedType === 'video') {
      matchesType = course.courseType === 'video' || ((course.modules?.length || 0) > 0 && (!course.files || course.files.length === 0));
    } else if (selectedType === 'pdf') {
      matchesType = course.courseType === 'pdf' || ((!course.modules || course.modules.length === 0) && ((course.files?.length || 0) > 0 || Boolean(course.pdfFileUrl)));
    } else if (selectedType === 'bundle') {
      matchesType = course.courseType === 'bundle' || ((course.modules?.length || 0) > 0 && ((course.files?.length || 0) > 0 || Boolean(course.pdfFileUrl)));
    }

    return matchesSearch && matchesCategory && matchesType;
  }).sort((a, b) => {
    const priceA = a.price ?? a.salePrice ?? 0;
    const priceB = b.price ?? b.salePrice ?? 0;
    if (sortBy === 'price-low') return priceA - priceB;
    if (sortBy === 'price-high') return priceB - priceA;
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  return (
    <div className="py-12 bg-slate-950 min-h-screen">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Unified Learning Catalog
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
            Explore All Courses & Study Resources
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl">
            Browse our complete collection of video masterclasses, architecture PDF handbooks, and hands-on starter bundles.
          </p>
        </div>

        {/* Filters & Format Selector */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <Input 
                type="text" 
                placeholder="Search by topic, instructor, or keywords (e.g. Next.js, Docker, System Design)..." 
                className="pl-11 h-12 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 rounded-lg text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Format Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-3.5 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedType === 'all'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                All Courses ({courses.length})
              </button>
              <button
                onClick={() => setSelectedType('video')}
                className={`px-3.5 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  selectedType === 'video'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                Video Lessons
              </button>
              <button
                onClick={() => setSelectedType('pdf')}
                className={`px-3.5 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  selectedType === 'pdf'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                PDF Handbooks
              </button>
              <button
                onClick={() => setSelectedType('bundle')}
                className={`px-3.5 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  selectedType === 'bundle'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Video + PDF Bundles
              </button>
            </div>
          </div>

          {/* Category Chips and Sort */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
              <Button 
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                className={`h-8 text-xs font-medium rounded-md ${selectedCategory === null ? 'bg-indigo-600 text-white' : 'bg-slate-900 border-slate-800 text-slate-300'}`}
                onClick={() => setSelectedCategory(null)}
              >
                All Categories
              </Button>
              {categories.map(category => (
                <Button 
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  className={`h-8 text-xs font-medium rounded-md whitespace-nowrap ${selectedCategory === category ? 'bg-indigo-600 text-white' : 'bg-slate-900 border-slate-800 text-slate-300'}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2 ml-auto text-xs text-slate-400">
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-md px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
              >
                <option value="recommended">Newest & Featured</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : (
          <CourseGrid courses={filteredCourses} />
        )}
      </div>
    </div>
  );
}
