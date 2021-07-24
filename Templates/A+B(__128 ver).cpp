#include<bits/stdc++.h>
using namespace std;
__int128 a,b;
void read(__int128 &x){
    __int128 f=1;
    x=0;
    char s=getchar();
    while(s<'0' or s>'9')
    {
        if (s=='-') f=-1;
        s=getchar();
    }
    while(s>='0' and s<='9')
    {
        x=x*10+s-'0';
        s=getchar();
    }
    x*=f;
}
void write(__int128 x){
    if(x<0)
    {
        putchar('-');
        x=-x;
    }
    if(x>9) write(x/10);
    putchar(x%10+'0');
}
int main(){
    read(a);
    read(b);
    write(a+b);
    return 0;
}