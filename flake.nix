{
  description = "Proyecto 2, completar el set base de Modern Horizons 3";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs = { nixpkgs, ... }:
    let
      sistemas = [ "aarch64-darwin" "x86_64-darwin" "x86_64-linux" "aarch64-linux" ];
      paraCadaSistema = funcion: nixpkgs.lib.genAttrs sistemas (sistema: funcion nixpkgs.legacyPackages.${sistema});
    in
    {
      devShells = paraCadaSistema (pkgs: {
        default = pkgs.mkShell {
          # Python para la simulación; Node y pnpm para la presentación web en web/
          packages = [ pkgs.python313 pkgs.nodejs_22 pkgs.pnpm_10 ];
          # Las ruedas de pip de numpy y matplotlib traen binarios que buscan libstdc++ y libz del sistema; en NixOS
          # no están en las rutas estándar, así que se les pasan las de Nix
          LD_LIBRARY_PATH = pkgs.lib.optionalString pkgs.stdenv.isLinux
            (pkgs.lib.makeLibraryPath [ pkgs.stdenv.cc.cc.lib pkgs.zlib ]);
          # Las versiones exactas de los paquetes de Python salen de requirements.txt, instalados en .venv
          shellHook = ''
            if [ ! -d .venv ]; then
              python3 -m venv .venv
            fi
            source .venv/bin/activate
            pip install --quiet --disable-pip-version-check -r requirements.txt
          '';
        };
      });
    };
}
