export default function ConfiguracoesPage() {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl font-headline">Configurações</h1>
            </div>
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
                <p className="text-muted-foreground">Conteúdo das Configurações</p>
            </div>
        </main>
    );
}
