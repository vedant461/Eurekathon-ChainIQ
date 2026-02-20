import React, { createContext, useContext, useState, ReactNode } from 'react';

type PersonaType = 'retailer' | 'tier1_supplier' | 'tier2_supplier';

interface PersonaContextType {
    persona: PersonaType;
    setPersona: (persona: PersonaType) => void;
    getPersonaLabel: () => string;
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

export function PersonaProvider({ children }: { children: ReactNode }) {
    const [persona, setPersona] = useState<PersonaType>('retailer');

    const getPersonaLabel = () => {
        switch (persona) {
            case 'retailer': return 'Retailer (MegaMart)';
            case 'tier1_supplier': return 'Tier 1 Roaster (VRT Nuts)';
            case 'tier2_supplier': return 'Tier 2 Farm (Valley Farms)';
            default: return 'Unknown';
        }
    };

    return (
        <PersonaContext.Provider value={{ persona, setPersona, getPersonaLabel }}>
            {children}
        </PersonaContext.Provider>
    );
}

export function usePersona() {
    const context = useContext(PersonaContext);
    if (context === undefined) {
        throw new Error('usePersona must be used within a PersonaProvider');
    }
    return context;
}
