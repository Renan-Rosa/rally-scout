"use client";

import {
    ChartNoAxesColumnIncreasing,
    HelpCircleIcon,
    History,
    Mail,
    Monitor,
    MonitorPlay,
    SaveIcon,
    SettingsIcon,
    Shield,
    TrashIcon,
    User2,
    Volleyball,
} from "lucide-react";
import {
    Menubar,
    MenubarContent,
    MenubarGroup,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarShortcut,
    MenubarTrigger,
} from "@/components/ui/menubar";

export function Menu() {
    return (
        <Menubar className='w-auto'>
            <MenubarMenu>
                <MenubarTrigger>Geral</MenubarTrigger>
                <MenubarContent>
                    <MenubarItem>
                        <Shield />
                        Times
                    </MenubarItem>
                    <MenubarItem>
                        <User2 />
                        Atletas
                    </MenubarItem>
                    <MenubarItem>
                        <Volleyball />
                        Partidas
                    </MenubarItem>
                </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger>Scout</MenubarTrigger>
                <MenubarContent>
                    <MenubarGroup>
                        <MenubarItem>
                            <Monitor />
                            Novo Scout
                        </MenubarItem>
                        <MenubarItem>
                            <History />
                            Histórico de Scouts
                        </MenubarItem>
                        <MenubarItem>
                            <ChartNoAxesColumnIncreasing />
                            Estatísticas
                        </MenubarItem>
                    </MenubarGroup>
                </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
                <MenubarTrigger>Sistema</MenubarTrigger>
                <MenubarContent>
                    <MenubarGroup>
                        <MenubarItem>
                            <SettingsIcon />
                            Configurações
                        </MenubarItem>
                        <MenubarItem>
                            <Mail />
                            Contato
                        </MenubarItem>
                        <MenubarItem>
                            <HelpCircleIcon />
                            Ajuda
                        </MenubarItem>
                    </MenubarGroup>
                </MenubarContent>
            </MenubarMenu>
        </Menubar>
    );
}
