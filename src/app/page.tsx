"use client"

import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { CommandEmpty } from "cmdk";
import { useState, useEffect } from "react";

export default function Home() {
  const [input, setInput] = useState<string>('');
  const [searchResults, setSearchResults] = useState<{
    results : string[]
    duration : number
  }>();

  useEffect(() => {
    const fetchData = async () => {

      if(!input) return setSearchResults(undefined);

      const res = await fetch(`/api/search?q=${input}`);
      const data = await res.json() as {results: string[], duration: number};
      setSearchResults(data);
    }    
  
    fetchData();
  }, [input])
  

  return (
    <main className='h-screen w-screen bg-slate-100'>
    <div className='flex flex-col gap-6 items-center pt-32 duration-500 animate-in animate fade-in-5 slide-in-from-bottom-2.5'>
      <h1 className='text-5xl tracking-tight font-bold'>Fast Search</h1>
      <div className="max-w-md w-full">
        <Command>
          <CommandInput value={input} onValueChange={setInput} placeholder="Search countries..." className=" placeholder:text-zinc-500" />
          <CommandList>
            {
              searchResults?.results.length === 0? (
                <CommandEmpty>No results found</CommandEmpty>
              ) : null
            }{
              searchResults?.results ?(
                <CommandGroup heading="results">
                  {
                    searchResults.results.map((result) => (
                      <CommandItem key={result} value={result} onSelect={setInput}>{result}</CommandItem>
                    ))
                  }

                </CommandGroup>
              ) : null
            }
          </CommandList>
        </Command>
      </div>

      </div>

    </main>
  );
}
