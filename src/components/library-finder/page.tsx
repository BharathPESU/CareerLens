
'use client';

import { motion } from 'framer-motion';
import { LibrarySquare, Map, Search, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function LibraryFinderPage() {

  return (
    <div className="p-4 md:p-8 space-y-8">
       <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl font-bold flex items-center gap-3 font-headline text-glow">
                <LibrarySquare className="w-8 h-8 text-primary"/>
                Nearest Library Finder
            </h1>
            <p className="text-muted-foreground">Discover quiet places to study and read near you.</p>
       </motion.div>
       
       <Card className="glass-card">
        <CardHeader>
          <CardTitle>Find a Library</CardTitle>
          <CardDescription>Enter your location to find libraries in your area.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5"/>
            <input 
              placeholder="Enter your address, city, or zip code..." 
              className="w-full bg-secondary border-border rounded-lg p-3 pl-10 text-base" 
            />
          </div>
          <Button size="lg" className="w-full sm:w-auto">
            <Search className="mr-2" />
            Find Libraries
          </Button>
        </CardContent>
      </Card>
      
      <Alert>
        <Map className="h-4 w-4" />
        <AlertTitle>Feature in Development</AlertTitle>
        <AlertDescription>
          The interactive map and real-time library data via Google Maps API are coming soon!
        </AlertDescription>
      </Alert>

      {/* Placeholder for map */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="aspect-video bg-muted/50 rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Map will be displayed here</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Placeholder for library list */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((item) => (
          <Card key={item} className="glass-card hover:-translate-y-1 transition-transform">
            <CardHeader>
              <CardTitle>City Central Library</CardTitle>
              <CardDescription>1.2 miles away</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">123 Main St, Anytown, USA</p>
              <div className="flex items-center gap-2 text-sm text-green-400">
                <Wifi className="w-4 h-4" />
                <span>Free Wi-Fi Available</span>
              </div>
              <Button variant="outline" className="w-full">Get Directions</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
