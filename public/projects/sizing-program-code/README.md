# Process Equipment Sizing Tool

Preliminary sizing for pumps, pipelines, heat exchangers, tanks, reactors and flash drums.
The same calculations power the live web version at https://hekmatk.com/calculator.

## Run it

```
pip install streamlit
streamlit run app.py      # interactive app
python main.py            # prints every module's example result
```

## Modules

| File | What it does |
|---|---|
| `piping.py` | Velocity, Reynolds number, flow regime, Darcy friction factor (64/Re or Swamee–Jain), major and minor head losses |
| `pipe_sizing.py` | Diameter from a target velocity, standard Sch 40 pipe selection, line hydraulics and velocity checks |
| `system.py` | Total dynamic head from static, pressure and friction terms |
| `pump.py` | Hydraulic and shaft power |
| `npsh.py` | Net positive suction head available |
| `heat_exchanger.py` | Duty, cold outlet temperature, LMTD (counter- or co-current), area and tube count |
| `tank.py` | Vessel volume, diameter and length from hold-up time, fill fraction and L/D |
| `reactions.py` | CSTR and PFR volumes for -rA = k·CA^n |
| `flash.py` | Isothermal flash (Rachford–Rice) with constant K-values |
| `units.py` | Mass and volumetric flow conversions |

All inputs are SI. Results are screening-level estimates.
