'use client';

import { useState, useEffect } from 'react';

declare global {
  interface Window {
    SherryTriggerUIExtension?: any;
  }
}

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.SherryTriggerUIExtension) {
      window.SherryTriggerUIExtension.init({
        triggerSelector: "#sherry-trigger",
      });
    }
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-900 via-indigo-700 to-indigo-400 text-white flex flex-col">
      {/* Hero Section */}
    
      <section className="flex-1 flex flex-col justify-center items-center text-center px-4 py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-indigo-500 opacity-30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-400 opacity-20 rounded-full blur-2xl animate-pulse" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight drop-shadow-xl font-mono">
            CampusDAO Connect
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 font-medium drop-shadow font-mono">
            La plataforma tech para la gobernanza estudiantil descentralizada
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#features" className="px-8 py-3 bg-gradient-to-r from-cyan-400 to-indigo-600 rounded-xl font-bold text-lg shadow-lg hover:scale-105 hover:from-indigo-600 hover:to-cyan-400 transition-all duration-200 font-mono tracking-wide">
              Explorar características
            </a>
            <a href="#contacto" className="px-8 py-3 border-2 border-white/30 rounded-xl font-bold text-lg shadow hover:bg-white/10 hover:scale-105 transition-all duration-200 font-mono tracking-wide">
              Contactar equipo
            </a>
            <button
              id="sherry-trigger"
              className="px-8 py-3 bg-gradient-to-r from-pink-400 to-cyan-500 rounded-xl font-bold text-lg shadow-lg hover:scale-105 transition-all duration-200 font-mono tracking-wide border-2 border-white/30"
            >
              Conectar con Sherry
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white text-gray-900 relative z-10">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-mono">¿Por qué CampusDAO Connect?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-indigo-100 to-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center hover:scale-105 transition-transform border border-indigo-100">
              <svg className="w-12 h-12 mb-4 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3 0 1.657 1.343 3 3 3s3-1.343 3-3c0-1.657-1.343-3-3-3zm0 0V4m0 8v8m8-8h-8m8 0a8 8 0 11-16 0 8 8 0 0116 0z" /></svg>
              <h3 className="font-bold text-xl mb-2 font-mono">Descentralización real</h3>
              <p className="text-gray-700">Vota, propone y participa en la toma de decisiones de tu campus usando tecnología blockchain.</p>
            </div>
            <div className="bg-gradient-to-br from-cyan-100 to-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center hover:scale-105 transition-transform border border-cyan-100">
              <svg className="w-12 h-12 mb-4 text-cyan-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m4 0h-1v-4h-1m-4 0h-1v-4h-1m4 0h-1v-4h-1" /></svg>
              <h3 className="font-bold text-xl mb-2 font-mono">Transparencia total</h3>
              <p className="text-gray-700">Todas las propuestas y votaciones quedan registradas y auditables por la comunidad estudiantil.</p>
              </div>
            <div className="bg-gradient-to-br from-indigo-100 to-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center hover:scale-105 transition-transform border border-indigo-100">
              <svg className="w-12 h-12 mb-4 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              <h3 className="font-bold text-xl mb-2 font-mono">Fácil de usar</h3>
              <p className="text-gray-700">Interfaz intuitiva, moderna y accesible para cualquier estudiante o miembro del campus.</p>
          </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-indigo-700 to-cyan-500 text-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 font-mono">¿Listo para transformar tu campus?</h2>
        <p className="mb-8 text-lg font-mono">Únete a la revolución de la gobernanza estudiantil con CampusDAO Connect.</p>
        <a href="#contacto" className="inline-block px-10 py-4 bg-white text-indigo-700 font-bold rounded-xl shadow-lg hover:bg-indigo-100 hover:text-indigo-900 transition-all text-lg font-mono">
          ¡Contáctanos!
        </a>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-indigo-900 text-indigo-100 text-center text-sm border-t border-indigo-800">
        <div className="max-w-4xl mx-auto px-4">
          <p className="mb-2 font-mono">Desarrollado para <span className="font-semibold text-cyan-400">Sherry Hackathon 2025</span></p>
          <div className="flex justify-center gap-6 text-xs text-indigo-300">
            <a href="#" className="hover:text-cyan-400 transition-colors font-mono">Términos</a>
            <a href="#" className="hover:text-cyan-400 transition-colors font-mono">Privacidad</a>
            <a href="#" className="hover:text-cyan-400 transition-colors font-mono">Contacto</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
