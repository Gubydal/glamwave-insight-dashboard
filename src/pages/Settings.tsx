
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/Dashboard/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { Separator } from '@/components/ui/separator';

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  
  return (
    <div className="flex min-h-screen bg-salon-background">
      <Sidebar />
      
      <div className="ml-16 md:ml-56 w-full p-6">
        <h1 className="text-3xl font-playfair font-bold mb-6">Settings</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-2">
            <Card className="shadow-lg border-salon-tertiary/20">
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize how GlamWave looks and feels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base" htmlFor="dark-mode">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Switch between dark and light mode
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sun className="h-5 w-5 text-muted-foreground" />
                    <Switch 
                      id="dark-mode" 
                      checked={theme === "dark"} 
                      onCheckedChange={(checked) => {
                        setTheme(checked ? "dark" : "light");
                        toast({
                          title: `Theme changed to ${checked ? "dark" : "light"} mode`,
                          duration: 2000,
                        });
                      }} 
                    />
                    <Moon className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6 shadow-lg border-salon-tertiary/20">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Get in touch with GlamWave
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Email</h3>
                    <p className="text-muted-foreground">
                      <a 
                        href="mailto:glamwave@proton.me" 
                        className="text-salon-primary hover:underline"
                      >
                        glamwave@proton.me
                      </a>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="col-span-1">
            <Card className="h-full shadow-lg border-salon-tertiary/20">
              <CardHeader>
                <CardTitle>Privacy Policy</CardTitle>
                <CardDescription>
                  How we handle your data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose prose-sm max-w-none">
                  <h3 className="text-lg font-medium">GlamWave Privacy Policy</h3>
                  <p className="text-sm text-muted-foreground">Last Updated: May 7, 2025</p>
                  
                  <h4 className="text-base font-medium mt-4">1. Data Collection</h4>
                  <p className="text-sm">
                    We collect personal information that you voluntarily provide to us when using our services.
                    This may include contact information, usage data, and other information you choose to share.
                  </p>
                  
                  <h4 className="text-base font-medium mt-4">2. How We Use Your Data</h4>
                  <p className="text-sm">
                    We use your information to provide and improve our services,
                    communicate with you, and ensure the security of your account.
                  </p>
                  
                  <h4 className="text-base font-medium mt-4">3. Data Security</h4>
                  <p className="text-sm">
                    We implement appropriate technical and organizational measures to protect your personal data
                    against unauthorized access, alteration, disclosure, or destruction.
                  </p>
                  
                  <h4 className="text-base font-medium mt-4">4. Contact Us</h4>
                  <p className="text-sm">
                    For questions about this privacy policy, please email us at{" "}
                    <a href="mailto:glamwave@proton.me" className="text-salon-primary hover:underline">
                      glamwave@proton.me
                    </a>
                  </p>
                </div>
                
                <Separator />
                
                <div className="pt-2">
                  <Button variant="outline" className="w-full">
                    Download Full Privacy Policy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
