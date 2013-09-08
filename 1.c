#include<stdio.h>

//////////////////////////////////////////////////////////////////////////////////////////////////
typedef struct node{
        //char * head;
        char value;
        struct node * next;
}Node;
 
typedef struct ls{                                                                                        
		Node *head;
		Node *tail;
		Node *travPointer;
}list;
////////////////////////////////////////////////////////////////////////////////////////////////////

void addToRight(char c,list *List1){
        Node *temp;
        temp=(Node *) malloc(sizeof(Node));
        temp->value=c;
        temp->next=NULL;
        if(List1->head->next==NULL){
			List1->head->next=temp;
		}
        List1->tail->next=temp;
        List1->tail=temp;
        
}

void addToLeft(char c,list *List){
        Node *temp;
        temp=(Node *) malloc(sizeof(Node));
        temp->value=c;
        temp->next= List->head;
        List->head = temp;
}

void listInit(list *List1){
        List1->head=(Node *) malloc(sizeof(Node));
        List1->head->value = 0;
        List1->head->next=NULL;
        List1->travPointer=List1->head;
        List1->tail=List1->head;
}
list* reverse(list* List){
		list* revList;
		listInit(revList);
		List->travPointer = List->head;
        revList->tail->value = List->head->value;
		revList->tail->next = NULL;
		while( List->travPointer->next !=NULL){
			List->travPointer = List->travPointer->next;
			addToLeft(List->travPointer->value,revList);
		}
		return revList;
}

///////////////////////////////////////////////////////////////////////////////////////////

int addTwoValues(int *carry,int a, int b){
		int sum=(*carry + a +b);
		if(sum<2){
			*carry =0;
			return sum;
		}
        else{
		*carry=sum/2;
		return sum%2;
		}
}

void add(list* list1,list* list2, list * resList){
        int carry=0;
        while( (list1->travPointer->next!=NULL)&&(list2->travPointer->next!=NULL) ){
                addToRight('0'+ addTwoValues(&carry,(int)(list1->travPointer->value-'0'),(int)(list2->travPointer->value-'0') ), resList);
                list1->travPointer=list1->travPointer->next;
                list2->travPointer=list2->travPointer->next;
        }
        //when second list is greater in length than first one

        if(list1->travPointer->next==NULL){
				while( list2->travPointer->next!=NULL){
							addToRight( '0'+ addTwoValues(&carry,0,(int)(list2->travPointer->value-'0') ),resList);
                            list2->travPointer=list2->travPointer->next;
				}
        }
        if(list2->travPointer->next==NULL){
				while( list1->travPointer->next!=NULL){
						addToRight( '0'+ addTwoValues(&carry,0,(int)(list1->travPointer->value-'0') ) ,resList);
                        list1->travPointer=list1->travPointer->next;
                }
        }
        if(carry!=0){
                addToRight( (char)( '0'+ carry),resList);
        }
}

list* sum(list* List1, list* List2){
		list *revList1, *revList2, *resultRev;
		listInit(revList1); listInit(revList2); listInit(resultRev);
		revList1 = reverse(List1); revList2 = reverse(List2);
		add( revList1, revList2, resultRev);
		return reverse(resultRev);	
}

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
			addToRight(current->next->value, temp);
			current = current->next;
		}
		
		
		//multiplying
		current = list2->head;
		while(current->next != NULL){
			addToRight('0', temp);
			current = current->next;
			if(current->value = '1'); 
				//temp = add(temp, list1);
		}
		return temp;
}

void printList(list *List){
		List->travPointer = List->head;   
		printf("%c ",List->travPointer->value);
        while( List->travPointer->next !=NULL){
            printf("%c ",List->travPointer->value);
			List->travPointer=List->travPointer->next;
        }
}

int main(){
		//initializations
		char c;
        list List1;
		list List2;
		list *outputList;
		listInit(&List1);
		listInit(&List2);
        printList(&List1);
		//inputting
        scanf("%c",&c);
        while( c!='\n'){
           addToRight(c,&List1);                                                                                       
           scanf("%c",&c);
        }
		putchar('\n');
        scanf("%c",&c);
        while( c!='\n'){
                addToRight(c,&List2);                                                                                       
                scanf("%c",&c);
        }
		
		//adding
		outputList = sum(&List1, &List2);
		printf("s");
		printList(outputList);
		//multiplying
		outputList = product(&List1, &List2);
		printf("p");
		printList(outputList);
		
}
