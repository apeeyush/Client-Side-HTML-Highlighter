#include<stdio.h>

typedef struct node{
        //char * head;
        char value;
        struct node * next;
}Node;
 
typedef struct ls{                                                                                        // struct defined
		Node *head;
		Node *tail;
		Node *travPointer;
}list;


void makenode(char c,list *List)
{
        Node *temp;
        temp=(Node *) malloc(sizeof(Node));
        temp->value=c;
        temp->next=NULL;
        if(List->head->next==NULL){
			List->head->next=temp;
			//List->travPointer->next=temp;
		}
        List->tail->next=temp;
        List->tail=temp;
        //return List->tail;
}

void listInit(list *List)
{
        List->head=(Node *) malloc(sizeof(Node));
        List->head->value = 0;
        List->head->next=NULL;
		
        List->travPointer=(Node *) malloc(sizeof(Node));
        List->travPointer=List->head;

        List->tail=(Node *) malloc(sizeof(Node));
        List->tail=List->head;
}
/*
list* add(list *list1, list *list2){
		list temp;
		listInit(&temp);
		int a, b, q = 0, r;
		a = (int)(list1->tail->value - 48);
		b = (int)(list2->tail->value - 48);
		r = (a+b)%2;
		q =  (a+b)/2;
		tem->head->value = r;
		Node *tempNode = (Node *)malloc(sizeof(Node));
		tempNode->next = temp.head;
		temp.head = tempNode;
		
}
*/

list* product(list* list1, list* list2){
		list *temp;
		Node *current;
		Node *currentOfTemp;
		temp = (list *)malloc(sizeof(list));
		listInit(temp);
		
		//copying list1 to temp
		
		current = (list1->head);
		currentOfTemp = temp->head;
		currentOfTemp->value = current->value;
		while(current->next != NULL){
			makenode(current->next->value, temp);
			current = current->next;
		}
		
		
		//multiplying
		current = list2->head;
		while(current->next != NULL){
			makenode('0', temp);
			current = current->next;
			if(current->value = '1'); 
				//temp = add(temp, list1);
		}
		return temp;
}

int main(){
		char c;
        list List;
		list List2;
		list *List3;
		listInit(&List);
        List.head->value=0;
		List.tail->value=0;
		List.travPointer->next=NULL;
        scanf("%c",&c);
        while( c!='\n'){
                makenode(c,&List);                                                                                       
                scanf("%c",&c);
        }
		
		// for printing
        List.travPointer=List.head;                                                                        
        while( List.travPointer !=NULL){
            printf("%c ",List.travPointer->value);
			List.travPointer=List.travPointer->next;
        }
		putchar('\n');
		
		listInit(&List2);
        List2.head->value=0;
		List2.tail->value=0;
		List2.travPointer->next=NULL;
        scanf("%c",&c);
        while( c!='\n'){
                makenode(c,&List2);                                                                                       
                scanf("%c",&c);
        }
		
		List2.travPointer=List2.head;                                                                        
        while( List2.travPointer !=NULL){
            printf("%c ",List2.travPointer->value);
			List2.travPointer=List2.travPointer->next;
        }
		
		putchar('\n');
		
		List3 = product(&List, &List2);
		printf("a%");
		List3->travPointer = List3->head;                                                                        
        while( List3->travPointer !=NULL){
            printf("%c ",List3->travPointer->value);
			List3->travPointer=List3->travPointer->next;
        }
		
}
