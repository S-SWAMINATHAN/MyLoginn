import math
C=1577917828.0
REV={'Sun':4320000,'Moon':57753336,'Mars':2296832,'MercuryS':17937060,'Jupiter':364220,'VenusS':7022376,'Saturn':146568,'MoonApo':488203,'Node':232238}
APO={'Sun':77+17/60,'Mars':130+2/60,'Mercury':220+26/60,'Jupiter':171+18/60,'Venus':79+50/60,'Saturn':236+38/60}
MANDA={'Sun':(14,13+40/60),'Moon':(32,31+40/60),'Mars':(75,72),'Mercury':(30,28),'Jupiter':(33,32),'Venus':(12,11),'Saturn':(49,48)}
SIGHRA={'Mars':(235,232),'Mercury':(133,132),'Jupiter':(70,72),'Venus':(262,260),'Saturn':(39,40)}
def frac(x): return x-math.floor(x)
def mean(name,A): return frac(A*REV[name]/C)*360.0
def ecc(pair,anom):
    ev,od=pair; return ev-(ev-od)*abs(math.sin(math.radians(anom)))
def manda_eq(pair,anom):
    e=ecc(pair,anom)/360.0
    return math.degrees(math.asin(e*math.sin(math.radians(anom))))
def sighra_eq(pair,K):
    r=ecc(pair,K)/360.0
    return math.degrees(math.atan2(r*math.sin(math.radians(K)),1+r*math.cos(math.radians(K))))
def positions(A, shift=0.0, apo=APO):
    A=A+shift
    out={}
    ms=mean('Sun',A)
    out['Sun']=(ms-manda_eq(MANDA['Sun'],ms-apo['Sun']))%360
    mm=mean('Moon',A); ma=(mean('MoonApo',A)+90)%360
    out['Moon']=(mm-manda_eq(MANDA['Moon'],mm-ma))%360
    out['Rahu']=(180-mean('Node',A))%360
    for p in ('Mars','Jupiter','Saturn','Mercury','Venus'):
        if p in ('Mars','Jupiter','Saturn'):
            M=mean(p,A); S=ms
        else:
            M=ms; S=mean(p+'S',A)
        # 1: half sighra
        P1=M+0.5*sighra_eq(SIGHRA[p],S-M)
        # 2: half manda from P1
        P2=P1-0.5*manda_eq(MANDA[p],P1-apo[p])
        # 3: full manda on mean using P2 anomaly
        P3=M-manda_eq(MANDA[p],P2-apo[p])
        # 4: full sighra
        P4=P3+sighra_eq(SIGHRA[p],S-P3)
        out[p]=P4%360
    return out
